"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { getSupabase } from "@/lib/supabase";
import { Users, Search, ChevronRight, UserPlus, Filter } from "lucide-react";

interface Worker {
  id: string;
  full_name: string | null;
  role: string;
  updated_at: string;
}

export default function WorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    const supabase = getSupabase();

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, role, updated_at')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching workers:', error);
        return;
      }

      setWorkers(data || []);
    } catch (err) {
      console.error('Error fetching workers:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredWorkers = workers.filter(worker => {
    const matchesSearch = (worker.full_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || worker.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'worker': return { bg: '#ecfdf5', color: '#059669' };
      case 'client': return { bg: '#eff6ff', color: '#3b82f6' };
      case 'admin': return { bg: '#f3e8ff', color: '#8b5cf6' };
      case 'super_admin': return { bg: '#fef3c7', color: '#d97706' };
      default: return { bg: '#f1f5f9', color: '#64748b' };
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="page-header">
        <div className="header-content">
          <h1>Users</h1>
          <p>Manage all users in the system</p>
        </div>
        <Link href="/signup" className="btn-primary">
          <UserPlus size={18} />
          Add User
        </Link>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card">
          <Users size={20} color="var(--primary-color)" />
          <span className="stat-value">{workers.length}</span>
          <span className="stat-label">Total Users</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{workers.filter(w => w.role === 'worker').length}</span>
          <span className="stat-label">Workers</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{workers.filter(w => w.role === 'client').length}</span>
          <span className="stat-label">Clients</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{workers.filter(w => w.role === 'admin' || w.role === 'super_admin').length}</span>
          <span className="stat-label">Admins</span>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <Filter size={18} />
          <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
            <option value="all">All Roles</option>
            <option value="worker">Workers</option>
            <option value="client">Clients</option>
            <option value="admin">Admins</option>
            <option value="super_admin">Super Admins</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="table-container">
        {loading ? (
          <div className="loading-state">Loading users...</div>
        ) : filteredWorkers.length === 0 ? (
          <div className="empty-state">
            <Users size={48} color="#cbd5e1" />
            <p>No users found</p>
          </div>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Last Updated</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredWorkers.map((worker) => (
                <tr key={worker.id}>
                  <td>
                    <strong>{worker.full_name || 'No name'}</strong>
                  </td>
                  <td>
                    <span
                      className="role-badge"
                      style={{
                        backgroundColor: getRoleColor(worker.role).bg,
                        color: getRoleColor(worker.role).color
                      }}
                    >
                      {worker.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td>{new Date(worker.updated_at).toLocaleDateString()}</td>
                  <td>
                    <Link href={`/dashboard/admin/workers/${worker.id}`} className="view-link">
                      View <ChevronRight size={14} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <style jsx>{`
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 32px;
        }

        .header-content h1 {
          font-size: 32px;
          margin-bottom: 8px;
        }

        .header-content p {
          color: #64748b;
        }

        .btn-primary {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: var(--primary-color);
          color: white;
          border: none;
          border-radius: var(--radius-md);
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s;
        }

        .btn-primary:hover {
          opacity: 0.9;
        }

        .stats-row {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          background: white;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
        }

        .stat-value {
          font-size: 20px;
          font-weight: 700;
          color: var(--primary-color);
        }

        .stat-label {
          font-size: 13px;
          color: #64748b;
        }

        .filters-bar {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 16px;
          background: white;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          flex: 1;
          max-width: 400px;
        }

        .search-box input {
          border: none;
          outline: none;
          flex: 1;
          font-size: 14px;
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 16px;
          background: white;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
        }

        .filter-group select {
          border: none;
          outline: none;
          font-size: 14px;
          background: transparent;
          cursor: pointer;
        }

        .table-container {
          background: white;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          overflow: hidden;
        }

        .loading-state, .empty-state {
          padding: 60px;
          text-align: center;
          color: #64748b;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .users-table {
          width: 100%;
          border-collapse: collapse;
        }

        .users-table th {
          padding: 14px 20px;
          text-align: left;
          background: #f8fafc;
          font-size: 12px;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid var(--border-color);
        }

        .users-table td {
          padding: 16px 20px;
          border-bottom: 1px solid var(--border-color);
          font-size: 14px;
        }

        .users-table tr:last-child td {
          border-bottom: none;
        }

        .users-table tr:hover {
          background: #f8fafc;
        }

        .role-badge {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          text-transform: capitalize;
        }

        .view-link {
          display: flex;
          align-items: center;
          gap: 4px;
          color: var(--secondary-color);
          font-weight: 600;
          font-size: 13px;
          text-decoration: none;
        }

        .view-link:hover {
          color: var(--primary-color);
        }
      `}</style>
    </DashboardLayout>
  );
}
