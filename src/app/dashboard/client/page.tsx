"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";

import { Calendar, FileText, User, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";
import { StatCardSkeleton, CardGridSkeleton, SkeletonStyles } from "@/components/SkeletonLoader";

export default function ClientDashboard() {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const supabase = getSupabase();

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { session } }: any = await supabase.auth.getSession();
            if (session) {
                const { data } = await supabase
                    .from('profiles')
                    .select('full_name')
                    .eq('id', session.user.id)
                    .single();
                setProfile(data);
            }
            setLoading(false);
        };
        fetchProfile();
    }, []);

    if (loading) {
        return <><StatCardSkeleton count={3} /><CardGridSkeleton count={3} /><SkeletonStyles /></>;
    }

    return (
        <>
            <div className="welcome-section">
                <h2>Welcome back, {profile?.full_name?.split(' ')[0] || 'there'}!</h2>
                <p>Here's an overview of your care and support services.</p>
            </div>

                {/* Quick Stats */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">
                            <Calendar size={24} color="var(--secondary-color)" />
                        </div>
                        <div className="stat-content">
                            <h3>Upcoming Appointments</h3>
                            <p className="stat-number">3</p>
                            <p className="stat-label">This week</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">
                            <FileText size={24} color="var(--primary-color)" />
                        </div>
                        <div className="stat-content">
                            <h3>Documents</h3>
                            <p className="stat-number">12</p>
                            <p className="stat-label">Available to view</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">
                            <CheckCircle size={24} color="#10b981" />
                        </div>
                        <div className="stat-content">
                            <h3>Care Plan Status</h3>
                            <p className="stat-number">Active</p>
                            <p className="stat-label">Last updated 2 days ago</p>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="actions-section">
                    <h3>Quick Actions</h3>
                    <div className="action-cards">
                        <Link href="/dashboard/client/signing" className="action-card">
                            <FileText size={32} />
                            <h4>Sign Documents</h4>
                            <p>Review and sign pending documents</p>
                        </Link>

                        <div className="action-card disabled">
                            <Calendar size={32} />
                            <h4>View Appointments</h4>
                            <p>See your upcoming schedule</p>
                            <span className="coming-soon">Coming Soon</span>
                        </div>

                        <div className="action-card disabled">
                            <User size={32} />
                            <h4>My Care Team</h4>
                            <p>View your support workers</p>
                            <span className="coming-soon">Coming Soon</span>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="activity-section">
                    <h3>Recent Activity</h3>
                    <div className="activity-list">
                        <div className="activity-item">
                            <div className="activity-icon">
                                <Clock size={20} color="var(--secondary-color)" />
                            </div>
                            <div className="activity-content">
                                <p><strong>Document signed:</strong> Care Plan Agreement</p>
                                <span className="activity-time">2 days ago</span>
                            </div>
                        </div>
                        <div className="activity-item">
                            <div className="activity-icon">
                                <Calendar size={20} color="var(--primary-color)" />
                            </div>
                            <div className="activity-content">
                                <p><strong>Appointment completed:</strong> Weekly check-in</p>
                                <span className="activity-time">5 days ago</span>
                            </div>
                        </div>
                    </div>
                </div>

            <style jsx>{`
        .loading {
          text-align: center;
          padding: 60px;
          font-size: 16px;
          color: #64748b;
        }

        .welcome-section {
          margin-bottom: 32px;
        }

        .welcome-section h2 {
          font-size: 32px;
          margin-bottom: 8px;
          color: var(--primary-color);
        }

        .welcome-section p {
          color: #64748b;
          font-size: 16px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
          margin-bottom: 40px;
        }

        .stat-card {
          background: white;
          padding: 24px;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-sm);
          display: flex;
          gap: 16px;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          background: var(--accent-color);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .stat-content h3 {
          font-size: 14px;
          color: #64748b;
          margin-bottom: 8px;
          font-weight: 500;
        }

        .stat-number {
          font-size: 28px;
          font-weight: 700;
          color: var(--primary-color);
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 13px;
          color: #94a3b8;
        }

        .actions-section,
        .activity-section {
          margin-bottom: 40px;
        }

        .actions-section h3,
        .activity-section h3 {
          font-size: 20px;
          margin-bottom: 20px;
          color: var(--primary-color);
        }

        .action-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }

        .action-card {
          background: white;
          padding: 32px 24px;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-sm);
          text-align: center;
          transition: all 0.2s;
          cursor: pointer;
          position: relative;
          text-decoration: none;
          color: inherit;
        }

        .action-card:not(.disabled):hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
          border: 2px solid var(--secondary-color);
        }

        .action-card.disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .action-card h4 {
          margin: 16px 0 8px;
          font-size: 18px;
          color: var(--primary-color);
        }

        .action-card p {
          color: #64748b;
          font-size: 14px;
        }

        .coming-soon {
          position: absolute;
          top: 12px;
          right: 12px;
          background: var(--secondary-color);
          color: white;
          padding: 4px 8px;
          border-radius: var(--radius-sm);
          font-size: 11px;
          font-weight: 600;
        }

        .activity-list {
          background: white;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-sm);
          overflow: hidden;
        }

        .activity-item {
          display: flex;
          gap: 16px;
          padding: 20px 24px;
          border-bottom: 1px solid var(--border-color);
        }

        .activity-item:last-child {
          border-bottom: none;
        }

        .activity-icon {
          width: 40px;
          height: 40px;
          background: var(--accent-color);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .activity-content {
          flex: 1;
        }

        .activity-content p {
          margin-bottom: 4px;
          color: var(--primary-color);
        }

        .activity-time {
          font-size: 13px;
          color: #94a3b8;
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .action-cards {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
        </>
    );
}
