import { getSupabaseServer } from "@/lib/supabase-server";
import TemplatesGrid from "@/components/TemplatesGrid";

export default async function AdminDocumentsPage() {
  const supabase = await getSupabaseServer();

  const { data } = await supabase
    .from('document_templates')
    .select('id, name, description, category, template_type, is_active, created_at')
    .order('created_at', { ascending: false });

  return <TemplatesGrid templates={data || []} />;
}
