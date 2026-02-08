"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, Clock, CheckCircle, AlertCircle, ChevronRight, Download } from "lucide-react";

interface PendingDocument {
  id: string;
  template_name: string;
  description: string;
  status: string;
  sent_at: string;
  expires_at: string | null;
  access_token: string;
}

interface SignedDocument {
  id: string;
  template_name: string;
  signed_at: string;
  valid_until: string | null;
  download_url: string;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getDaysUntilExpiry(expiresAt: string | null) {
  if (!expiresAt) return null;
  return Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export default function ClientSigningView({
  pendingDocs,
  signedDocs,
}: {
  pendingDocs: PendingDocument[];
  signedDocs: SignedDocument[];
}) {
  const [activeTab, setActiveTab] = useState<"pending" | "signed">("pending");

  return (
    <>
      <div className="welcome-banner">
        <h1>Document Signing</h1>
        <p>Review and sign your documents</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <Clock size={24} color="#f59e0b" />
          <div>
            <h3>{pendingDocs.length}</h3>
            <p>Awaiting Signature</p>
          </div>
        </div>
        <div className="stat-card">
          <CheckCircle size={24} color="#10b981" />
          <div>
            <h3>{signedDocs.length}</h3>
            <p>Signed Documents</p>
          </div>
        </div>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === "pending" ? "active" : ""}`}
          onClick={() => setActiveTab("pending")}
        >
          <Clock size={18} />
          Pending ({pendingDocs.length})
        </button>
        <button
          className={`tab ${activeTab === "signed" ? "active" : ""}`}
          onClick={() => setActiveTab("signed")}
        >
          <CheckCircle size={18} />
          Signed ({signedDocs.length})
        </button>
      </div>

      {activeTab === "pending" ? (
        <section className="documents-section">
          {pendingDocs.length === 0 ? (
            <div className="empty-state">
              <CheckCircle size={48} color="#10b981" />
              <h3>All caught up!</h3>
              <p>You have no pending documents to sign.</p>
            </div>
          ) : (
            <div className="documents-list">
              {pendingDocs.map((doc) => {
                const daysUntilExpiry = getDaysUntilExpiry(doc.expires_at);
                const isUrgent = daysUntilExpiry !== null && daysUntilExpiry <= 7;

                return (
                  <div key={doc.id} className={`document-card ${isUrgent ? "urgent" : ""}`}>
                    <div className="document-icon">
                      <FileText size={24} color="var(--primary-color)" />
                    </div>
                    <div className="document-content">
                      <div className="document-header">
                        <h3>{doc.template_name}</h3>
                        {doc.status === "viewed" && (
                          <span className="viewed-badge">Viewed</span>
                        )}
                      </div>
                      <p className="document-description">{doc.description}</p>
                      <div className="document-meta">
                        <span>Sent: {formatDate(doc.sent_at)}</span>
                        {doc.expires_at && (
                          <span className={isUrgent ? "urgent-text" : ""}>
                            <AlertCircle size={14} />
                            Expires in {daysUntilExpiry} days
                          </span>
                        )}
                      </div>
                    </div>
                    <Link href={`/sign/${doc.access_token}`} className="sign-btn">
                      Sign Now
                      <ChevronRight size={18} />
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      ) : (
        <section className="documents-section">
          {signedDocs.length === 0 ? (
            <div className="empty-state">
              <FileText size={48} color="#64748b" />
              <h3>No signed documents yet</h3>
              <p>Documents you sign will appear here.</p>
            </div>
          ) : (
            <div className="documents-list">
              {signedDocs.map((doc) => (
                <div key={doc.id} className="document-card signed">
                  <div className="document-icon">
                    <CheckCircle size={24} color="#10b981" />
                  </div>
                  <div className="document-content">
                    <h3>{doc.template_name}</h3>
                    <div className="document-meta">
                      <span>Signed: {formatDate(doc.signed_at)}</span>
                      {doc.valid_until && (
                        <span>Valid until: {formatDate(doc.valid_until)}</span>
                      )}
                    </div>
                  </div>
                  <a href={doc.download_url} className="download-btn">
                    <Download size={18} />
                    Download
                  </a>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      <style jsx>{`
        .welcome-banner { margin-bottom: 40px; }
        .welcome-banner h1 { font-size: 32px; margin-bottom: 8px; }
        .welcome-banner p { color: #64748b; }
        .stats-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 24px; margin-bottom: 32px;
        }
        .stat-card {
          background: white; padding: 24px; border-radius: var(--radius-lg);
          border: 1px solid var(--border-color); display: flex; align-items: center; gap: 20px;
        }
        .stat-card h3 { font-size: 28px; margin-bottom: 4px; }
        .stat-card p { color: #64748b; font-size: 14px; }
        .tabs { display: flex; gap: 8px; margin-bottom: 24px; }
        .tab {
          display: flex; align-items: center; gap: 8px; padding: 12px 20px;
          border: 1px solid var(--border-color); border-radius: var(--radius-md);
          background: white; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s;
        }
        .tab:hover { border-color: var(--primary-color); }
        .tab.active { background: var(--primary-color); color: white; border-color: var(--primary-color); }
        .documents-list { display: flex; flex-direction: column; gap: 16px; }
        .document-card {
          display: flex; align-items: center; gap: 20px; padding: 24px;
          background: white; border-radius: var(--radius-lg);
          border: 1px solid var(--border-color); transition: all 0.2s;
        }
        .document-card:hover { box-shadow: var(--shadow-md); border-color: var(--primary-color); }
        .document-card.urgent { border-color: #f59e0b; background: linear-gradient(to right, #fffbeb, white); }
        .document-card.signed { border-color: #10b981; }
        .document-icon {
          width: 56px; height: 56px; background: #f8fafc; border-radius: var(--radius-md);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .document-content { flex: 1; }
        .document-header { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
        .document-header h3 { font-size: 18px; }
        .viewed-badge {
          padding: 4px 8px; background: #ede9fe; color: #7c3aed;
          border-radius: 4px; font-size: 11px; font-weight: 600;
        }
        .document-description { color: #64748b; font-size: 14px; margin-bottom: 12px; }
        .document-meta { display: flex; gap: 20px; font-size: 13px; color: #64748b; }
        .document-meta span { display: flex; align-items: center; gap: 6px; }
        .urgent-text { color: #f59e0b; font-weight: 500; }
        .sign-btn {
          display: flex; align-items: center; gap: 8px; padding: 12px 24px;
          background: var(--primary-color); color: white; border-radius: var(--radius-md);
          font-weight: 600; text-decoration: none; transition: all 0.2s; flex-shrink: 0;
        }
        .sign-btn:hover { opacity: 0.9; transform: translateX(2px); }
        .download-btn {
          display: flex; align-items: center; gap: 8px; padding: 12px 20px;
          background: white; color: var(--primary-color); border: 1px solid var(--primary-color);
          border-radius: var(--radius-md); font-weight: 600; text-decoration: none;
          transition: all 0.2s; flex-shrink: 0;
        }
        .download-btn:hover { background: var(--primary-color); color: white; }
        .empty-state {
          text-align: center; padding: 64px 24px; background: white;
          border-radius: var(--radius-lg); border: 1px solid var(--border-color);
        }
        .empty-state h3 { margin-top: 16px; font-size: 20px; }
        .empty-state p { color: #64748b; margin-top: 8px; }
        @media (max-width: 768px) {
          .document-card { flex-direction: column; align-items: flex-start; }
          .sign-btn, .download-btn { width: 100%; justify-content: center; }
        }
      `}</style>
    </>
  );
}
