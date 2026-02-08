"use client";

import { useState, useEffect } from "react";
import { getSupabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Heart, Mail, Copy, CheckCircle, Shield, LogOut, User, Clock, Users, Crown } from "lucide-react";
import Link from "next/link";

interface Invite {
  id: string;
  email: string;
  token: string;
  role?: string;
  created_at: string;
  expires_at: string;
  used: boolean;
  used_at: string | null;
}

export default function AdminInvitePage() {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>("");
  const [email, setEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"client" | "worker" | "admin">("worker");
  const [loading, setLoading] = useState(false);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const supabase = getSupabase();

  const isSuperAdmin = userRole === 'super_admin';

  useEffect(() => {
    checkAuth();
    loadInvites();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    // Verify user is admin or super admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile?.role || !['admin', 'super_admin'].includes(profile.role)) {
      router.push("/dashboard/worker");
      return;
    }

    setUser(user);
    setUserRole(profile.role);
  };

  const loadInvites = async () => {
    // Load both admin invites and user invites
    const { data: adminInvites } = await supabase
      .from('admin_invites')
      .select('*')
      .order('created_at', { ascending: false });

    const { data: userInvites } = await supabase
      .from('user_invites')
      .select('*')
      .order('created_at', { ascending: false });

    const allInvites = [
      ...(adminInvites || []).map((inv: any) => ({ ...inv, role: 'admin' })),
      ...(userInvites || [])
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    setInvites(allInvites);
  };

  const generateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      // Super admin can invite admins, regular admin can only invite clients/workers
      if (inviteRole === 'admin') {
        if (!isSuperAdmin) {
          throw new Error("Only Super Admins can invite other administrators");
        }

        const { error } = await supabase
          .from('admin_invites')
          .insert({
            email,
            token,
            invited_by: user.id,
            expires_at: expiresAt.toISOString(),
          });

        if (error) throw error;
      } else {
        // Client or Worker invite
        const { error } = await supabase
          .from('user_invites')
          .insert({
            email,
            token,
            role: inviteRole,
            invited_by: user.id,
            expires_at: expiresAt.toISOString(),
          });

        if (error) throw error;
      }

      setSuccess(`Invite created for ${email} as ${inviteRole}!`);
      setEmail("");
      loadInvites();
    } catch (err: any) {
      setError(err.message || "Failed to create invite");
    } finally {
      setLoading(false);
    }
  };

  const copyInviteLink = (token: string, role: string) => {
    const baseUrl = window.location.origin;
    const inviteUrl = role === 'admin'
      ? `${baseUrl}/signup/admin/${token}`
      : `${baseUrl}/signup/invite/${token}`;

    navigator.clipboard.writeText(inviteUrl);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (!user) {
    return (
      <div className="container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <Link href="/dashboard/admin" className="logo">
            <Heart size={32} color="var(--secondary-color)" />
            <h1>Time For Hope</h1>
          </Link>
          <div className="user-section">
            <div className="user-info">
              {isSuperAdmin ? <Crown size={20} color="#f59e0b" /> : <Shield size={20} />}
              <span>{user?.email}</span>
              <span className={`role-badge ${isSuperAdmin ? 'super' : 'admin'}`}>
                {isSuperAdmin ? 'Super Admin' : 'Admin'}
              </span>
            </div>
            <button onClick={handleLogout} className="btn-secondary">
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main">
        <div className="page-header">
          <Users size={40} color="var(--secondary-color)" />
          <div>
            <h2>Invite Users</h2>
            <p>
              {isSuperAdmin
                ? "Invite administrators, support workers, or clients to join your platform"
                : "Invite support workers or clients to join your platform"}
            </p>
          </div>
        </div>

        {/* Create Invite Form */}
        <div className="invite-form-card">
          <h3>Create New Invite</h3>
          <form onSubmit={generateInvite} className="invite-form">
            <div className="role-selector">
              <button
                type="button"
                className={`role-btn ${inviteRole === 'client' ? 'active' : ''}`}
                onClick={() => setInviteRole('client')}
              >
                <Heart size={20} />
                <span>Client</span>
              </button>
              <button
                type="button"
                className={`role-btn ${inviteRole === 'worker' ? 'active' : ''}`}
                onClick={() => setInviteRole('worker')}
              >
                <User size={20} />
                <span>Support Worker</span>
              </button>
              {isSuperAdmin && (
                <button
                  type="button"
                  className={`role-btn ${inviteRole === 'admin' ? 'active' : ''}`}
                  onClick={() => setInviteRole('admin')}
                >
                  <Shield size={20} />
                  <span>Administrator</span>
                </button>
              )}
            </div>

            <div className="input-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <Mail size={20} />
                <input
                  id="email"
                  type="email"
                  placeholder={`${inviteRole}@example.com`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Creating..." : `Invite ${inviteRole.charAt(0).toUpperCase() + inviteRole.slice(1)}`}
            </button>
          </form>
        </div>

        {/* Invites List */}
        <div className="invites-section">
          <h3>Recent Invitations</h3>
          {invites.length === 0 ? (
            <div className="empty-state">
              <Users size={48} color="#cbd5e1" />
              <p>No invitations yet. Create your first invite above!</p>
            </div>
          ) : (
            <div className="invites-list">
              {invites.map((invite) => (
                <div key={invite.id} className={`invite-card ${invite.used ? 'used' : ''}`}>
                  <div className="invite-header">
                    <div className="invite-email">
                      <Mail size={20} />
                      <span>{invite.email}</span>
                      <span className={`type-badge ${invite.role || 'admin'}`}>
                        {invite.role || 'admin'}
                      </span>
                    </div>
                    <div className={`status-badge ${invite.used ? 'used' : 'pending'}`}>
                      {invite.used ? 'Used' : 'Pending'}
                    </div>
                  </div>

                  <div className="invite-details">
                    <div className="detail">
                      <Clock size={16} />
                      <span>Created: {new Date(invite.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="detail">
                      <Clock size={16} />
                      <span>Expires: {new Date(invite.expires_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {!invite.used && (
                    <div className="invite-actions">
                      <button
                        onClick={() => copyInviteLink(invite.token, invite.role || 'admin')}
                        className="btn-copy"
                      >
                        {copiedToken === invite.token ? (
                          <>
                            <CheckCircle size={18} />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy size={18} />
                            Copy Invite Link
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {invite.used && invite.used_at && (
                    <div className="used-info">
                      ✓ Used on {new Date(invite.used_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <style jsx>{`
        .container {
          min-height: 100vh;
          background: var(--accent-color);
        }

        .loading {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          font-size: 18px;
        }

        .header {
          background: white;
          border-bottom: 1px solid var(--border-color);
          padding: 16px 24px;
          box-shadow: var(--shadow-sm);
        }

        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
        }

        .logo h1 {
          font-size: 24px;
          margin: 0;
          color: var(--primary-color);
        }

        .user-section {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: var(--accent-color);
          border-radius: var(--radius-md);
        }

        .role-badge {
          padding: 4px 8px;
          border-radius: var(--radius-sm);
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
        }

        .role-badge.super {
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          color: white;
        }

        .role-badge.admin {
          background: #dbeafe;
          color: #1e40af;
        }

        .main {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 24px;
        }

        .page-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 32px;
        }

        .page-header h2 {
          font-size: 32px;
          margin: 0 0 4px;
          color: var(--primary-color);
        }

        .page-header p {
          margin: 0;
          color: #64748b;
        }

        .invite-form-card {
          background: white;
          padding: 32px;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-sm);
          margin-bottom: 40px;
        }

        .invite-form-card h3 {
          margin: 0 0 24px;
          font-size: 20px;
          color: var(--primary-color);
        }

        .invite-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .role-selector {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 12px;
        }

        .role-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 16px;
          border: 2px solid var(--border-color);
          border-radius: var(--radius-md);
          background: white;
          cursor: pointer;
          transition: all 0.2s;
          color: #64748b;
        }

        .role-btn.active {
          border-color: var(--secondary-color);
          background: #f0fdfa;
          color: var(--secondary-color);
        }

        .role-btn span {
          font-size: 13px;
          font-weight: 600;
        }

        .input-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          font-size: 14px;
        }

        .input-wrapper {
          display: flex;
          align-items: center;
          gap: 12px;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 0 16px;
          transition: border-color 0.2s;
        }

        .input-wrapper:focus-within {
          border-color: var(--secondary-color);
        }

        .input-wrapper input {
          flex: 1;
          border: none;
          padding: 12px 0;
          outline: none;
          font-size: 16px;
        }

        .error-message {
          color: var(--error);
          background: #fef2f2;
          padding: 12px;
          border-radius: var(--radius-md);
          font-size: 14px;
          border: 1px solid #fee2e2;
        }

        .success-message {
          color: #10b981;
          background: #f0fdf4;
          padding: 12px;
          border-radius: var(--radius-md);
          font-size: 14px;
          border: 1px solid #d1fae5;
        }

        .invites-section h3 {
          font-size: 20px;
          margin-bottom: 20px;
          color: var(--primary-color);
        }

        .empty-state {
          background: white;
          padding: 60px 32px;
          border-radius: var(--radius-lg);
          text-align: center;
          color: #64748b;
        }

        .empty-state p {
          margin-top: 16px;
        }

        .invites-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .invite-card {
          background: white;
          padding: 24px;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-sm);
          border-left: 4px solid var(--secondary-color);
        }

        .invite-card.used {
          border-left-color: #cbd5e1;
          opacity: 0.7;
        }

        .invite-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .invite-email {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          color: var(--primary-color);
        }

        .type-badge {
          padding: 2px 8px;
          border-radius: var(--radius-sm);
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
        }

        .type-badge.admin {
          background: #fef3c7;
          color: #92400e;
        }

        .type-badge.worker {
          background: #dbeafe;
          color: #1e40af;
        }

        .type-badge.client {
          background: #fce7f3;
          color: #9f1239;
        }

        .status-badge {
          padding: 4px 12px;
          border-radius: var(--radius-sm);
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .status-badge.pending {
          background: #fef3c7;
          color: #92400e;
        }

        .status-badge.used {
          background: #e5e7eb;
          color: #6b7280;
        }

        .invite-details {
          display: flex;
          gap: 24px;
          margin-bottom: 16px;
        }

        .detail {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          color: #64748b;
        }

        .invite-actions {
          display: flex;
          gap: 12px;
        }

        .btn-copy {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: var(--accent-color);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all 0.2s;
          font-size: 14px;
          font-weight: 500;
        }

        .btn-copy:hover {
          background: #e0f2fe;
          border-color: var(--secondary-color);
        }

        .used-info {
          font-size: 13px;
          color: #10b981;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
            gap: 16px;
          }

          .invite-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .invite-details {
            flex-direction: column;
            gap: 8px;
          }

          .role-selector {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
