"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { getSupabase } from "@/lib/supabase";
import {
  Users, AlertCircle, TrendingUp, ChevronRight,
  FileText, PenTool, UserPlus, Shield, Clock, CheckCircle, XCircle
} from "lucide-react";

interface DashboardStats {
  totalUsers: number;
  workers: number;
  clients: number;
  admins: number;
  pendingSignatures: number;
  completedSignatures: number;
  totalDocuments: number;
  recentUsers: Array<{ id: string; email: string; role: string; created_at: string }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    workers: 0,
    clients: 0,
    admins: 0,
    pendingSignatures: 0,
    completedSignatures: 0,
    totalDocuments: 0,
    recentUsers: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    const supabase = getSupabase();

    try {
      // Run all queries in parallel - select only needed columns
      const [profilesResult, signingResult, templatesResult] = await Promise.all([
        supabase.from('profiles').select('id, role, full_name, updated_at'),
        supabase.from('signing_requests').select('status'),
        supabase.from('document_templates').select('id', { count: 'exact', head: true }).eq('is_active', true),
      ]);

      const profiles: any[] = profilesResult.data || [];
      const signingRequests: any[] = signingResult.data || [];
      const templateCount = templatesResult.count || 0;

      const workers = profiles.filter((p: any) => p.role === 'worker');
      const clients = profiles.filter((p: any) => p.role === 'client');
      const admins = profiles.filter((p: any) => p.role === 'admin' || p.role === 'super_admin');

      const pending = signingRequests.filter((s: any) => ['pending', 'sent', 'viewed'].includes(s.status));
      const completed = signingRequests.filter((s: any) => s.status === 'signed');

      // Reuse profiles data for recent users (sorted by updated_at, top 5)
      const recentUsers = [...profiles]
        .sort((a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .slice(0, 5)
        .map(p => ({
          id: p.id,
          email: p.full_name || 'No name',
          role: p.role,
          created_at: p.updated_at,
        }));

      setStats({
        totalUsers: profiles.length,
        workers: workers.length,
        clients: clients.length,
        admins: admins.length,
        pendingSignatures: pending.length,
        completedSignatures: completed.length,
        totalDocuments: templateCount,
        recentUsers,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const completionRate = stats.pendingSignatures + stats.completedSignatures > 0
    ? Math.round((stats.completedSignatures / (stats.pendingSignatures + stats.completedSignatures)) * 100)
    : 0;

  return (
    <>
      <div className="welcome-banner">
        <h1>Admin Dashboard</h1>
        <p>Overview of users, documents, and compliance status across the organization.</p>
      </div>

      {loading ? (
        <div className="loading-state">Loading dashboard...</div>
      ) : (
        <>
          {/* Main Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card">
              <Users size={24} color="var(--primary-color)" />
              <div>
                <h3>{stats.totalUsers}</h3>
                <p>Total Users</p>
              </div>
            </div>
            <div className="stat-card">
              <Clock size={24} color="#f59e0b" />
              <div>
                <h3>{stats.pendingSignatures}</h3>
                <p>Pending Signatures</p>
              </div>
            </div>
            <div className="stat-card">
              <CheckCircle size={24} color="var(--secondary-color)" />
              <div>
                <h3>{stats.completedSignatures}</h3>
                <p>Completed Signatures</p>
              </div>
            </div>
            <div className="stat-card">
              <FileText size={24} color="#8b5cf6" />
              <div>
                <h3>{stats.totalDocuments}</h3>
                <p>Active Templates</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <section className="dashboard-section">
            <h2>Quick Actions</h2>
            <div className="actions-grid">
              <Link href="/admin/invite" className="action-card">
                <Shield size={28} color="var(--secondary-color)" />
                <div className="action-content">
                  <h3>Invite Admin</h3>
                  <p>Add new administrators</p>
                </div>
                <ChevronRight size={20} />
              </Link>
              <Link href="/dashboard/admin/signing" className="action-card">
                <PenTool size={28} color="#8b5cf6" />
                <div className="action-content">
                  <h3>Document Signing</h3>
                  <p>Manage signing requests</p>
                </div>
                <ChevronRight size={20} />
              </Link>
              <Link href="/dashboard/admin/documents" className="action-card">
                <FileText size={28} color="#f59e0b" />
                <div className="action-content">
                  <h3>Documents</h3>
                  <p>Manage document templates</p>
                </div>
                <ChevronRight size={20} />
              </Link>
              <Link href="/signup" className="action-card">
                <UserPlus size={28} color="#10b981" />
                <div className="action-content">
                  <h3>Add User</h3>
                  <p>Create worker or client</p>
                </div>
                <ChevronRight size={20} />
              </Link>
            </div>
          </section>

          {/* Analytics Section */}
          <div className="analytics-row">
            {/* User Distribution Chart */}
            <section className="dashboard-section chart-section">
              <h2>User Distribution</h2>
              <div className="chart-container">
                <div className="donut-chart">
                  <div className="donut-segment workers" style={{ '--percentage': `${(stats.workers / Math.max(stats.totalUsers, 1)) * 100}%` } as React.CSSProperties}></div>
                  <div className="donut-center">
                    <span className="donut-value">{stats.totalUsers}</span>
                    <span className="donut-label">Users</span>
                  </div>
                </div>
                <div className="chart-legend">
                  <div className="legend-item">
                    <span className="legend-color workers"></span>
                    <span>Workers ({stats.workers})</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color clients"></span>
                    <span>Clients ({stats.clients})</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color admins"></span>
                    <span>Admins ({stats.admins})</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Signing Completion Rate */}
            <section className="dashboard-section chart-section">
              <h2>Signing Completion Rate</h2>
              <div className="completion-chart">
                <div className="completion-ring">
                  <svg viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" strokeWidth="12" />
                    <circle
                      cx="50" cy="50" r="40"
                      fill="none"
                      stroke="var(--secondary-color)"
                      strokeWidth="12"
                      strokeDasharray={`${completionRate * 2.51} 251`}
                      strokeLinecap="round"
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                  <div className="completion-value">
                    <span className="percentage">{completionRate}%</span>
                    <span className="label">Complete</span>
                  </div>
                </div>
                <div className="completion-stats">
                  <div className="completion-stat">
                    <CheckCircle size={16} color="#10b981" />
                    <span>{stats.completedSignatures} Signed</span>
                  </div>
                  <div className="completion-stat">
                    <Clock size={16} color="#f59e0b" />
                    <span>{stats.pendingSignatures} Pending</span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Recent Activity */}
          <section className="dashboard-section">
            <h2>Recent Users</h2>
            <div className="table-container">
              <table className="worker-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', color: '#64748b' }}>
                        No users found
                      </td>
                    </tr>
                  ) : (
                    stats.recentUsers.map((user) => (
                      <tr key={user.id}>
                        <td><strong>{user.email}</strong></td>
                        <td>
                          <span className={`status-pill ${user.role}`}>
                            {user.role}
                          </span>
                        </td>
                        <td>{new Date(user.created_at).toLocaleDateString()}</td>
                        <td>
                          <Link href={`/dashboard/admin/workers/${user.id}`} className="table-link">
                            View <ChevronRight size={14} />
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      <style jsx>{`
        .welcome-banner {
          margin-bottom: 40px;
        }

        .welcome-banner h1 {
          font-size: 32px;
          margin-bottom: 8px;
        }

        .welcome-banner p {
          color: #64748b;
        }

        .loading-state {
          text-align: center;
          padding: 60px;
          color: #64748b;
          font-size: 16px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .stat-card {
          background: white;
          padding: 24px;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          gap: 16px;
          transition: all 0.2s;
        }

        .stat-card:hover {
          box-shadow: var(--shadow-md);
          transform: translateY(-2px);
        }

        .stat-card h3 {
          font-size: 28px;
          margin-bottom: 2px;
          color: var(--primary-color);
        }

        .stat-card p {
          color: #64748b;
          font-size: 13px;
          margin: 0;
        }

        .dashboard-section {
          margin-bottom: 40px;
        }

        .dashboard-section h2 {
          font-size: 18px;
          margin-bottom: 20px;
          color: var(--primary-color);
        }

        .actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 16px;
        }

        .action-card {
          background: white;
          padding: 20px;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          gap: 16px;
          text-decoration: none;
          transition: all 0.2s;
        }

        .action-card:hover {
          border-color: var(--secondary-color);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .action-content {
          flex: 1;
        }

        .action-content h3 {
          font-size: 15px;
          margin-bottom: 2px;
          color: var(--primary-color);
        }

        .action-content p {
          color: #64748b;
          font-size: 12px;
          margin: 0;
        }

        .analytics-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
          margin-bottom: 40px;
        }

        .chart-section {
          background: white;
          padding: 24px;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-color);
          margin-bottom: 0;
        }

        .chart-section h2 {
          margin-bottom: 24px;
        }

        .chart-container {
          display: flex;
          align-items: center;
          gap: 32px;
        }

        .donut-chart {
          position: relative;
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: conic-gradient(
            #10b981 0% calc(var(--percentage, 33%)),
            #3b82f6 calc(var(--percentage, 33%)) calc(var(--percentage, 33%) + 33%),
            #8b5cf6 calc(var(--percentage, 33%) + 33%) 100%
          );
        }

        .donut-center {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 80px;
          height: 80px;
          background: white;
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .donut-value {
          font-size: 24px;
          font-weight: 700;
          color: var(--primary-color);
        }

        .donut-label {
          font-size: 11px;
          color: #64748b;
        }

        .chart-legend {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
        }

        .legend-color {
          width: 12px;
          height: 12px;
          border-radius: 3px;
        }

        .legend-color.workers { background: #10b981; }
        .legend-color.clients { background: #3b82f6; }
        .legend-color.admins { background: #8b5cf6; }

        .completion-chart {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }

        .completion-ring {
          position: relative;
          width: 140px;
          height: 140px;
        }

        .completion-ring svg {
          width: 100%;
          height: 100%;
        }

        .completion-value {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
        }

        .completion-value .percentage {
          display: block;
          font-size: 28px;
          font-weight: 700;
          color: var(--primary-color);
        }

        .completion-value .label {
          font-size: 11px;
          color: #64748b;
        }

        .completion-stats {
          display: flex;
          gap: 24px;
        }

        .completion-stat {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #64748b;
        }

        .table-container {
          background: white;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-color);
          overflow: hidden;
        }

        .worker-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .worker-table th {
          padding: 14px 20px;
          background: #f8fafc;
          font-size: 12px;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid var(--border-color);
        }

        .worker-table td {
          padding: 16px 20px;
          border-bottom: 1px solid var(--border-color);
          font-size: 14px;
        }

        .worker-table tr:last-child td {
          border-bottom: none;
        }

        .status-pill {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          text-transform: capitalize;
        }

        .status-pill.worker { background: #ecfdf5; color: #059669; }
        .status-pill.client { background: #eff6ff; color: #3b82f6; }
        .status-pill.admin { background: #f3e8ff; color: #8b5cf6; }
        .status-pill.super_admin { background: #fef3c7; color: #d97706; }

        .table-link {
          display: flex;
          align-items: center;
          gap: 4px;
          color: var(--secondary-color);
          font-weight: 600;
          font-size: 13px;
          text-decoration: none;
        }

        .table-link:hover {
          color: var(--primary-color);
        }
      `}</style>
    </>
  );
}
