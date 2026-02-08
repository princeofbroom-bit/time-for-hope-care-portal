import { getSupabaseServer } from "@/lib/supabase-server";
import ClientDashboardView from "@/components/ClientDashboardView";

export default async function ClientDashboard() {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  let profileName = 'there';
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();
    if (data?.full_name) {
      profileName = data.full_name.split(' ')[0];
    }
  }

  return <ClientDashboardView profileName={profileName} />;
}
