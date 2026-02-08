import { getSupabaseServer } from "@/lib/supabase-server";
import AdminDashboardView from "@/components/AdminDashboardView";

export default async function AdminDashboard() {
  const supabase = await getSupabaseServer();

  const [profilesResult, signingResult, templatesResult] = await Promise.all([
    supabase.from('profiles').select('id, role, full_name, updated_at'),
    supabase.from('signing_requests').select('status'),
    supabase.from('document_templates').select('id', { count: 'exact', head: true }).eq('is_active', true),
  ]);

  const profiles: any[] = profilesResult.data || [];
  const signingRequests: any[] = signingResult.data || [];
  const templateCount = templatesResult.count || 0;

  const workersCount = profiles.filter((p: any) => p.role === 'worker').length;
  const clientsCount = profiles.filter((p: any) => p.role === 'client').length;
  const adminsCount = profiles.filter((p: any) => p.role === 'admin' || p.role === 'super_admin').length;

  const pending = signingRequests.filter((s: any) => ['pending', 'sent', 'viewed'].includes(s.status));
  const completed = signingRequests.filter((s: any) => s.status === 'signed');

  const recentUsers = [...profiles]
    .sort((a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5)
    .map((p: any) => ({
      id: p.id,
      name: p.full_name || 'No name',
      role: p.role,
      updated_at: p.updated_at,
    }));

  const completionRate = pending.length + completed.length > 0
    ? Math.round((completed.length / (pending.length + completed.length)) * 100)
    : 0;

  return (
    <AdminDashboardView
      totalUsers={profiles.length}
      pendingCount={pending.length}
      completedCount={completed.length}
      templateCount={templateCount}
      workersCount={workersCount}
      clientsCount={clientsCount}
      adminsCount={adminsCount}
      completionRate={completionRate}
      recentUsers={recentUsers}
    />
  );
}
