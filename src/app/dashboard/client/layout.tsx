import DashboardLayout from "@/components/DashboardLayout";
import { getSupabaseServer } from "@/lib/supabase-server";

export default async function ClientDashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <DashboardLayout role="client" userEmail={user?.email ?? null}>
      {children}
    </DashboardLayout>
  );
}
