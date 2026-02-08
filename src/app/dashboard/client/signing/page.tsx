import { getSupabaseServer } from "@/lib/supabase-server";
import ClientSigningView from "@/components/ClientSigningView";

export default async function ClientSigningPage() {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  let pendingDocs: any[] = [];
  let signedDocs: any[] = [];

  if (user) {
    // Fetch pending signing requests for this user
    const { data: pending } = await supabase
      .from('signing_requests')
      .select(`
        id,
        status,
        sent_at,
        expires_at,
        access_token,
        recipient_name,
        document_templates ( name, description )
      `)
      .eq('recipient_email', user.email)
      .in('status', ['pending', 'sent', 'viewed'])
      .order('sent_at', { ascending: false });

    pendingDocs = (pending || []).map((r: any) => ({
      id: r.id,
      template_name: r.document_templates?.name || 'Document',
      description: r.document_templates?.description || '',
      status: r.status,
      sent_at: r.sent_at,
      expires_at: r.expires_at,
      access_token: r.access_token,
    }));

    // Fetch signed documents for this user
    const { data: signed } = await supabase
      .from('signed_documents')
      .select(`
        id,
        signed_at,
        signing_requests (
          document_templates ( name )
        )
      `)
      .eq('signer_email', user.email)
      .order('signed_at', { ascending: false });

    signedDocs = (signed || []).map((d: any) => ({
      id: d.id,
      template_name: d.signing_requests?.document_templates?.name || 'Document',
      signed_at: d.signed_at,
      valid_until: null,
      download_url: `/api/documents/signed/${d.id}/download`,
    }));
  }

  return <ClientSigningView pendingDocs={pendingDocs} signedDocs={signedDocs} />;
}
