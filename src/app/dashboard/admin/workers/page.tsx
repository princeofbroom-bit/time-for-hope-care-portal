import { getSupabaseServer } from "@/lib/supabase-server";
import WorkersTable from "@/components/WorkersTable";

export default async function WorkersPage() {
  const supabase = await getSupabaseServer();

  const { data } = await supabase
    .from('profiles')
    .select('id, full_name, role, updated_at')
    .order('updated_at', { ascending: false });

  return <WorkersTable workers={data || []} />;
}
