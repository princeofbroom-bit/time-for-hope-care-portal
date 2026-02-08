"use client";

import Link from "next/link";
import { ArrowLeft, User, Phone, Calendar, Shield, Edit } from "lucide-react";

interface UserProfile {
  id: string;
  full_name: string | null;
  role: string;
  phone: string | null;
  updated_at: string;
  created_at: string;
}

function getRoleColor(role: string) {
  switch (role) {
    case 'worker': return { bg: '#ecfdf5', color: '#059669' };
    case 'client': return { bg: '#eff6ff', color: '#3b82f6' };
    case 'admin': return { bg: '#f3e8ff', color: '#8b5cf6' };
    case 'super_admin': return { bg: '#fef3c7', color: '#d97706' };
    default: return { bg: '#f1f5f9', color: '#64748b' };
  }
}

export default function WorkerDetailView({ user }: { user: UserProfile }) {
  return (
    <>
      <div className="page-header">
        <Link href="/dashboard/admin/workers" className="back-link">
          <ArrowLeft size={20} />
          Back to Users
        </Link>
      </div>

      <div className="profile-card">
        <div className="profile-header">
          <div className="avatar">
            <User size={40} />
          </div>
          <div className="profile-info">
            <h1>{user.full_name || 'No name'}</h1>
            <span
              className="role-badge"
              style={{
                backgroundColor: getRoleColor(user.role).bg,
                color: getRoleColor(user.role).color
              }}
            >
              {user.role.replace('_', ' ')}
            </span>
          </div>
          <div className="profile-actions">
            <button className="action-btn">
              <Edit size={16} />
              Edit
            </button>
          </div>
        </div>

        <div className="profile-details">
          <div className="detail-row">
            <div className="detail-icon">
              <Shield size={18} />
            </div>
            <div className="detail-content">
              <span className="detail-label">User ID</span>
              <span className="detail-value">{user.id}</span>
            </div>
          </div>

          {user.phone && (
            <div className="detail-row">
              <div className="detail-icon">
                <Phone size={18} />
              </div>
              <div className="detail-content">
                <span className="detail-label">Phone</span>
                <span className="detail-value">{user.phone}</span>
              </div>
            </div>
          )}

          <div className="detail-row">
            <div className="detail-icon">
              <Calendar size={18} />
            </div>
            <div className="detail-content">
              <span className="detail-label">Created</span>
              <span className="detail-value">
                {new Date(user.created_at || user.updated_at).toLocaleDateString('en-AU', {
                  year: 'numeric', month: 'long', day: 'numeric'
                })}
              </span>
            </div>
          </div>

          <div className="detail-row">
            <div className="detail-icon">
              <Calendar size={18} />
            </div>
            <div className="detail-content">
              <span className="detail-label">Last Updated</span>
              <span className="detail-value">
                {new Date(user.updated_at).toLocaleDateString('en-AU', {
                  year: 'numeric', month: 'long', day: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .page-header { margin-bottom: 24px; }
        .back-link {
          display: inline-flex; align-items: center; gap: 8px;
          color: #64748b; text-decoration: none; font-size: 14px; font-weight: 500;
        }
        .back-link:hover { color: var(--primary-color); }
        .profile-card {
          background: white; border: 1px solid var(--border-color);
          border-radius: var(--radius-lg); overflow: hidden;
        }
        .profile-header {
          display: flex; align-items: center; gap: 20px; padding: 32px;
          border-bottom: 1px solid var(--border-color); background: #f8fafc;
        }
        .avatar {
          width: 80px; height: 80px; background: white;
          border: 2px solid var(--border-color); border-radius: 50%;
          display: flex; align-items: center; justify-content: center; color: #94a3b8;
        }
        .profile-info { flex: 1; }
        .profile-info h1 { font-size: 24px; margin-bottom: 8px; }
        .role-badge {
          padding: 6px 14px; border-radius: 20px; font-size: 12px;
          font-weight: 600; text-transform: capitalize;
        }
        .profile-actions { display: flex; gap: 12px; }
        .action-btn {
          display: flex; align-items: center; gap: 6px; padding: 10px 16px;
          border: 1px solid var(--border-color); border-radius: var(--radius-md);
          background: white; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s;
        }
        .action-btn:hover { border-color: var(--primary-color); color: var(--primary-color); }
        .profile-details { padding: 24px 32px; }
        .detail-row {
          display: flex; align-items: flex-start; gap: 16px; padding: 16px 0;
          border-bottom: 1px solid var(--border-color);
        }
        .detail-row:last-child { border-bottom: none; }
        .detail-icon {
          width: 40px; height: 40px; background: #f1f5f9;
          border-radius: var(--radius-md); display: flex; align-items: center;
          justify-content: center; color: #64748b;
        }
        .detail-content { flex: 1; }
        .detail-label { display: block; font-size: 12px; color: #64748b; margin-bottom: 4px; }
        .detail-value { font-size: 14px; font-weight: 500; word-break: break-all; }
      `}</style>
    </>
  );
}
