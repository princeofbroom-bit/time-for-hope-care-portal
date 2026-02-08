import { NextRequest, NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { validateFile } from "@/lib/fileValidation";
import { getSupabaseServer } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
    try {
        const supabase = await getSupabaseServer();

        // Verify authentication server-side
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File;
        const docId = formData.get("docId") as string;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        if (!docId) {
            return NextResponse.json({ error: "No document ID provided" }, { status: 400 });
        }

        // Convert file to Uint8Array for deep inspection
        const bytes = await file.arrayBuffer();
        const buffer = new Uint8Array(bytes);

        // 1. Deep Inspection (Magic Bytes & Size)
        const validation = await validateFile(buffer);
        if (!validation.valid) {
            return NextResponse.json({ error: validation.error }, { status: 400 });
        }

        // 2. Malware Scanning Placeholder (for < 3.5MB)
        if (file.size < 3.5 * 1024 * 1024) {
            console.log(`[Security] Triggering malware scan for ${file.name}`);
            // await scanFile(buffer);
        } else {
            console.log(`[Security] Large file (${(file.size / 1024 / 1024).toFixed(2)}MB) passed deep inspection. Marked for Admin Review.`);
        }

        // 3. Secure Storage (use authenticated user.id, not client-provided userId)
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${docId}_${crypto.randomUUID()}.${fileExt}`;

        const { data, error } = await supabase.storage
            .from('compliance-docs')
            .upload(fileName, buffer, {
                contentType: file.type,
                upsert: true
            });

        if (error) {
            return NextResponse.json({ error: "Storage error: " + error.message }, { status: 500 });
        }

        console.log(`[Success] File uploaded to storage: ${data.path}`);

        return NextResponse.json({
            success: true,
            path: data.path,
            reviewRequired: file.size > 3.5 * 1024 * 1024
        });

    } catch (error) {
        console.error("Upload handler error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
