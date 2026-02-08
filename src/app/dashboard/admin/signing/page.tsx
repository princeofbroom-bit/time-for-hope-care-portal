import { getSupabaseServer } from "@/lib/supabase-server";
import SigningTable from "@/components/SigningTable";

export default async function AdminSigningPage() {
  const supabase = await getSupabaseServer();

  const { data } = await supabase
    .from('signing_requests')
    .select(`
      id,
      status,
      sent_at,
      signed_at,
      expires_at,
      recipient_name,
      recipient_email,
      document_templates ( name )
    `)
    .order('created_at', { ascending: false });

  const requests = (data || []).map((r: any) => ({
    id: r.id,
    template_name: r.document_templates?.name || 'Unknown',
    recipient_name: r.recipient_name,
    recipient_email: r.recipient_email,
    status: r.status,
    sent_at: r.sent_at,
    signed_at: r.signed_at,
    expires_at: r.expires_at,
  }));

  return <SigningTable requests={requests} />;
}
