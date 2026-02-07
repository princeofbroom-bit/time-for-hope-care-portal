"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { GraduationCap, CheckCircle2, PlayCircle, ChevronRight } from "lucide-react";

const MODULES = [
    { id: 1, title: "NDIS Foundations", description: "Understanding the National Disability Insurance Scheme.", duration: "15 mins" },
    { id: 2, title: "Health & Safety", description: "Essential safety protocols for aged care and disability support.", duration: "25 mins" },
    { id: 3, title: "Ethical Conduct", description: "Dignity, respect, and professional boundaries.", duration: "20 mins" },
    { id: 4, title: "Incident Reporting", description: "How and when to report incidents correctly.", duration: "10 mins" },
];

export default function InductionsPage() {
    const [completed, setCompleted] = useState<number[]>([1]); // Mock: Module 1 is done
    const [activeModule, setActiveModule] = useState<number | null>(null);

    const toggleComplete = (id: number) => {
        if (completed.includes(id)) {
            setCompleted(completed.filter(m => m !== id));
        } else {
            setCompleted([...completed, id]);
        }
    };

    return (
        <DashboardLayout role="worker">
            <div className="page-header">
                <h1>Induction Training</h1>
                <p>Complete these modules to finish your onboarding process.</p>
            </div>

            <div className="progress-overview">
                <div className="progress-info">
                    <span>Overall Progress</span>
                    <span>{Math.round((completed.length / MODULES.length) * 100)}%</span>
                </div>
                <div className="progress-bar">
                    <div
                        className="progress-fill"
                        style={{ width: `${(completed.length / MODULES.length) * 100}%` }}
                    ></div>
                </div>
            </div>

            <div className="module-list">
                {MODULES.map((module) => {
                    const isDone = completed.includes(module.id);
                    return (
                        <div key={module.id} className={`module-card ${isDone ? 'completed' : ''}`}>
                            <div className="module-content">
                                <div className="module-icon">
                                    {isDone ? <CheckCircle2 size={24} color="var(--success)" /> : <PlayCircle size={24} color="var(--primary-color)" />}
                                </div>
                                <div className="module-text">
                                    <h3>{module.title}</h3>
                                    <p>{module.description} • <strong>{module.duration}</strong></p>
                                </div>
                            </div>
                            <button className="module-action" onClick={() => toggleComplete(module.id)}>
                                {isDone ? 'Review' : 'Start Now'} <ChevronRight size={18} />
                            </button>
                        </div>
                    );
                })}
            </div>

            <style jsx>{`
        .page-header {
          margin-bottom: 40px;
        }

        .page-header h1 {
          font-size: 32px;
          margin-bottom: 8px;
        }

        .page-header p {
          color: #64748b;
        }

        .progress-overview {
          background: white;
          padding: 24px;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-color);
          margin-bottom: 40px;
        }

        .progress-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
          font-weight: 600;
          font-size: 14px;
        }

        .progress-bar {
          height: 12px;
          background: #f1f5f9;
          border-radius: 6px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: var(--secondary-color);
          transition: width 0.5s ease-out;
        }

        .module-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .module-card {
          background: white;
          padding: 24px;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-color);
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: all 0.2s;
        }

        .module-card.completed {
          background: #f8fafc;
          border-color: #e2e8f0;
        }

        .module-content {
          display: flex;
          gap: 20px;
          align-items: center;
        }

        .module-icon {
          width: 48px;
          height: 48px;
          background: #f1f5f9;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .module-text h3 {
          font-size: 18px;
          margin-bottom: 4px;
        }

        .module-text p {
          font-size: 14px;
          color: #64748b;
        }

        .module-action {
          background: transparent;
          color: var(--primary-color);
          display: flex;
          align-items: center;
          gap: 4px;
          font-weight: 600;
          border: 1px solid var(--border-color);
          padding: 8px 16px;
        }

        .module-action:hover {
          background: var(--accent-color);
        }

        .module-card.completed .module-action {
          color: #64748b;
        }
      `}</style>
        </DashboardLayout>
    );
}
