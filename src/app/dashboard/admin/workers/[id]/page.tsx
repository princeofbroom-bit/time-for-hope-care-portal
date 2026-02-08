import { getSupabaseServer } from "@/lib/supabase-server";
import WorkerDetailView from "@/components/WorkerDetailView";
import Link from "next/link";

export default async function WorkerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: userId } = await params;
  const supabase = await getSupabaseServer();

  const { data: user, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !user) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
        <p>User not found</p>
        <Link
          href="/dashboard/admin/workers"
          style={{
            display: 'inline-block', marginTop: '16px', padding: '10px 20px',
            background: 'var(--primary-color)', color: 'white',
            borderRadius: 'var(--radius-md)', textDecoration: 'none', fontWeight: 600,
          }}
        >
          Back to Users
        </Link>
      </div>
    );
  }

  return <WorkerDetailView user={user} />;
}
