"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

import {
  Send,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Mail,
  MoreVertical,
  Plus,
  Search,
  Filter
} from "lucide-react";
import { TableSkeleton, SkeletonStyles } from "@/components/SkeletonLoader";

interface SigningRequest {
  id: string;
  template_name: string;
  recipient_name: string;
  recipient_email: string;
  status: "pending" | "sent" | "viewed" | "signed" | "declined" | "expired";
  sent_at: string | null;
  signed_at: string | null;
  expires_at: string | null;
}

export default function AdminSigningPage() {
  const [requests, setRequests] = useState<SigningRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data
  useEffect(() => {
    setTimeout(() => {
      setRequests([
        {
          id: "1",
          template_name: "Service Agreement",
          recipient_name: "John Smith",
          recipient_email: "john.smith@email.com",
          status: "signed",
          sent_at: "2024-01-15T10:30:00Z",
          signed_at: "2024-01-15T14:45:00Z",
          expires_at: null,
        },
        {
          id: "2",
          template_name: "Consent Form",
          recipient_name: "Sarah Connor",
          recipient_email: "sarah.c@email.com",
          status: "viewed",
          sent_at: "2024-01-16T09:00:00Z",
          signed_at: null,
          expires_at: "2024-02-15T09:00:00Z",
        },
        {
          id: "3",
          template_name: "Privacy Policy",
          recipient_name: "Mike Johnson",
          recipient_email: "mike.j@email.com",
          status: "pending",
          sent_at: "2024-01-17T08:00:00Z",
          signed_at: null,
          expires_at: "2024-02-17T08:00:00Z",
        },
        {
          id: "4",
          template_name: "Service Agreement",
          recipient_name: "Emma Wilson",
          recipient_email: "emma.w@email.com",
          status: "expired",
          sent_at: "2024-01-01T10:00:00Z",
          signed_at: null,
          expires_at: "2024-01-15T10:00:00Z",
        },
        {
          id: "5",
          template_name: "Emergency Contact Form",
          recipient_name: "James Brown",
          recipient_email: "james.b@email.com",
          status: "declined",
          sent_at: "2024-01-10T11:00:00Z",
          signed_at: null,
          expires_at: null,
        },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { color: string; bg: string; icon: React.ReactNode }> = {
      pending: { color: "#f59e0b", bg: "#fef3c7", icon: <Clock size={14} /> },
      sent: { color: "#3b82f6", bg: "#dbeafe", icon: <Send size={14} /> },
      viewed: { color: "#8b5cf6", bg: "#ede9fe", icon: <Eye size={14} /> },
      signed: { color: "#10b981", bg: "#d1fae5", icon: <CheckCircle size={14} /> },
      declined: { color: "#ef4444", bg: "#fee2e2", icon: <XCircle size={14} /> },
      expired: { color: "#6b7280", bg: "#f3f4f6", icon: <Clock size={14} /> },
    };
    return configs[status] || configs.pending;
  };

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "pending" || r.status === "sent" || r.status === "viewed").length,
    signed: requests.filter((r) => r.status === "signed").length,
    expired: requests.filter((r) => r.status === "expired" || r.status === "declined").length,
  };

  const filteredRequests = requests.filter((request) => {
    const matchesFilter = filter === "all" || request.status === filter;
    const matchesSearch =
      request.recipient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.recipient_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.template_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-AU", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <div className="welcome-banner">
        <div className="banner-content">
          <h1>Signing Requests</h1>
          <p>Track and manage document signing requests</p>
        </div>
        <Link href="/dashboard/admin/signing/new" className="btn-primary">
          <Plus size={18} />
          New Request
        </Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <Send size={24} color="var(--primary-color)" />
          <div>
            <h3>{stats.total}</h3>
            <p>Total Requests</p>
          </div>
        </div>
        <div className="stat-card">
          <Clock size={24} color="#f59e0b" />
          <div>
            <h3>{stats.pending}</h3>
            <p>Awaiting Signature</p>
          </div>
        </div>
        <div className="stat-card">
          <CheckCircle size={24} color="#10b981" />
          <div>
            <h3>{stats.signed}</h3>
            <p>Completed</p>
          </div>
        </div>
        <div className="stat-card">
          <XCircle size={24} color="#ef4444" />
          <div>
            <h3>{stats.expired}</h3>
            <p>Expired/Declined</p>
          </div>
        </div>
      </div>

      <section className="dashboard-section">
        <div className="section-controls">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by name, email, or document..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-tabs">
            <button
              className={`filter-tab ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              All
            </button>
            <button
              className={`filter-tab ${filter === "pending" ? "active" : ""}`}
              onClick={() => setFilter("pending")}
            >
              Pending
            </button>
            <button
              className={`filter-tab ${filter === "signed" ? "active" : ""}`}
              onClick={() => setFilter("signed")}
            >
              Signed
            </button>
            <button
              className={`filter-tab ${filter === "expired" ? "active" : ""}`}
              onClick={() => setFilter("expired")}
            >
              Expired
            </button>
          </div>
        </div>

        {loading ? (
          <><TableSkeleton rows={5} columns={5} /><SkeletonStyles /></>
        ) : (
          <div className="table-container">
            <table className="requests-table">
              <thead>
                <tr>
                  <th>Recipient</th>
                  <th>Document</th>
                  <th>Status</th>
                  <th>Sent</th>
                  <th>Completed</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="empty-state">
                      No signing requests found
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((request) => {
                    const statusConfig = getStatusConfig(request.status);
                    return (
                      <tr key={request.id}>
                        <td>
                          <div className="recipient-info">
                            <strong>{request.recipient_name}</strong>
                            <span>{request.recipient_email}</span>
                          </div>
                        </td>
                        <td>{request.template_name}</td>
                        <td>
                          <span
                            className="status-badge"
                            style={{
                              backgroundColor: statusConfig.bg,
                              color: statusConfig.color,
                            }}
                          >
                            {statusConfig.icon}
                            {request.status}
                          </span>
                        </td>
                        <td>{formatDate(request.sent_at)}</td>
                        <td>{formatDate(request.signed_at)}</td>
                        <td>
                          <div className="action-buttons">
                            {(request.status === "pending" || request.status === "sent" || request.status === "viewed") && (
                              <button className="action-btn" title="Send Reminder">
                                <Mail size={16} />
                              </button>
                            )}
                            <button className="action-btn" title="View Details">
                              <Eye size={16} />
                            </button>
                            <button className="action-btn" title="More Options">
                              <MoreVertical size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <style jsx>{`
        .welcome-banner {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 40px;
        }

        .banner-content h1 {
          font-size: 32px;
          margin-bottom: 8px;
        }

        .banner-content p {
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
          cursor: pointer;
          text-decoration: none;
          transition: all 0.2s;
        }

        .btn-primary:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 24px;
          margin-bottom: 48px;
        }

        .stat-card {
          background: white;
          padding: 24px;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .stat-card h3 {
          font-size: 24px;
          margin-bottom: 4px;
        }

        .stat-card p {
          color: #64748b;
          font-size: 14px;
        }

        .section-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          gap: 16px;
          flex-wrap: wrap;
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: 12px;
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
          width: 100%;
          font-size: 14px;
        }

        .search-box svg {
          color: #64748b;
        }

        .filter-tabs {
          display: flex;
          gap: 8px;
        }

        .filter-tab {
          padding: 8px 16px;
          border: 1px solid var(--border-color);
          border-radius: 20px;
          background: white;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .filter-tab:hover {
          border-color: var(--primary-color);
        }

        .filter-tab.active {
          background: var(--primary-color);
          color: white;
          border-color: var(--primary-color);
        }

        .table-container {
          background: white;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-color);
          overflow: hidden;
        }

        .requests-table {
          width: 100%;
          border-collapse: collapse;
        }

        .requests-table th {
          padding: 16px 20px;
          text-align: left;
          background: #f8fafc;
          font-size: 13px;
          font-weight: 600;
          color: #64748b;
          border-bottom: 1px solid var(--border-color);
        }

        .requests-table td {
          padding: 16px 20px;
          border-bottom: 1px solid var(--border-color);
          font-size: 14px;
        }

        .requests-table tr:last-child td {
          border-bottom: none;
        }

        .recipient-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .recipient-info span {
          font-size: 12px;
          color: #64748b;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: capitalize;
        }

        .action-buttons {
          display: flex;
          gap: 8px;
        }

        .action-btn {
          width: 32px;
          height: 32px;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          background: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
          transition: all 0.2s;
        }

        .action-btn:hover {
          border-color: var(--primary-color);
          color: var(--primary-color);
        }

        .empty-state {
          text-align: center;
          padding: 48px;
          color: #64748b;
        }

        .loading-state {
          text-align: center;
          padding: 48px;
          color: #64748b;
          background: white;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-color);
        }
      `}</style>
    </>
  );
}
