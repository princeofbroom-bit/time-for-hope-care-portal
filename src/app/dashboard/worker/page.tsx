"use client";

import { FileText, GraduationCap, CheckCircle } from "lucide-react";

export default function WorkerDashboard() {
    return (
        <>
            <div className="welcome-banner">
                <h1>Hello, Support Worker</h1>
                <p>Keep your profile details and documents up to date for compliance.</p>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <FileText size={24} color="var(--primary-color)" />
                    <div>
                        <h3>3 / 5</h3>
                        <p>Documents Uploaded</p>
                    </div>
                </div>
                <div className="stat-card">
                    <GraduationCap size={24} color="var(--secondary-color)" />
                    <div>
                        <h3>40%</h3>
                        <p>Induction Progress</p>
                    </div>
                </div>
                <div className="stat-card">
                    <CheckCircle size={24} color="var(--success)" />
                    <div>
                        <h3>Active</h3>
                        <p>Compliance Status</p>
                    </div>
                </div>
            </div>

            <section className="dashboard-section">
                <h2>Recent Actions</h2>
                <div className="action-list">
                    <div className="action-item">
                        <div className="action-dot"></div>
                        <div className="action-details">
                            <strong>Uploaded Police Check</strong>
                            <span>Today at 2:30 PM</span>
                        </div>
                    </div>
                    <div className="action-item">
                        <div className="action-dot"></div>
                        <div className="action-details">
                            <strong>Completed Module 1: Introduction</strong>
                            <span>Yesterday</span>
                        </div>
                    </div>
                </div>
            </section>

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

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
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

        .dashboard-section h2 {
          font-size: 20px;
          margin-bottom: 24px;
        }

        .action-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .action-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: white;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
        }

        .action-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--secondary-color);
        }

        .action-details {
          display: flex;
          flex-direction: column;
        }

        .action-details strong {
          font-size: 14px;
        }

        .action-details span {
          font-size: 12px;
          color: #94a3b8;
        }
      `}</style>
        </>
    );
}
