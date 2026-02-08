import { Suspense } from "react";
import { getSupabaseServer } from "@/lib/supabase-server";
import NewSigningForm from "@/components/NewSigningForm";

export default async function NewSigningRequestPage() {
  const supabase = await getSupabaseServer();

  const { data } = await supabase
    .from('document_templates')
    .select('id, name, description, category, template_type')
    .eq('is_active', true)
    .order('name');

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewSigningForm templates={data || []} />
    </Suspense>
  );
}
