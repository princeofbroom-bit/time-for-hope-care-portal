"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { getSupabase } from "@/lib/supabase";
import { FileText, Plus, Upload, Edit, Trash2, Eye, ChevronRight } from "lucide-react";

interface DocumentTemplate {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  template_type: "pdf" | "online_form";
  is_active: boolean;
  created_at: string;
}

export default function AdminDocumentsPage() {
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    const supabase = getSupabase();

    try {
      const { data, error } = await supabase
        .from('document_templates')
        .select('id, name, description, category, template_type, is_active, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching templates:', error);
        return;
      }

      setTemplates(data || []);
    } catch (err) {
      console.error('Error fetching templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: "onboarding", label: "Onboarding" },
    { value: "consent", label: "Consent" },
    { value: "compliance", label: "Compliance" },
    { value: "policy", label: "Policy" },
  ];

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      onboarding: "#3b82f6",
      consent: "#10b981",
      compliance: "#f59e0b",
      policy: "#8b5cf6",
    };
    return colors[category] || "#64748b";
  };

  return (
    <DashboardLayout role="admin">
      <div className="welcome-banner">
        <div className="banner-content">
          <h1>Document Templates</h1>
          <p>Manage the documents that clients need to sign</p>
        </div>
        <button className="btn-primary" onClick={() => setShowUploadModal(true)}>
          <Plus size={18} />
          Add Template
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <FileText size={24} color="var(--primary-color)" />
          <div>
            <h3>{templates.length}</h3>
            <p>Total Templates</p>
          </div>
        </div>
        <div className="stat-card">
          <Upload size={24} color="#10b981" />
          <div>
            <h3>{templates.filter((t) => t.template_type === "pdf").length}</h3>
            <p>PDF Documents</p>
          </div>
        </div>
        <div className="stat-card">
          <Edit size={24} color="#f59e0b" />
          <div>
            <h3>{templates.filter((t) => t.template_type === "online_form").length}</h3>
            <p>Online Forms</p>
          </div>
        </div>
      </div>

      <section className="dashboard-section">
        <div className="section-header">
          <h2>All Templates</h2>
          <div className="filter-tabs">
            <button className="filter-tab active">All</button>
            {categories.map((cat) => (
              <button key={cat.value} className="filter-tab">
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="loading-state">Loading templates...</div>
        ) : (
          <div className="templates-grid">
            {templates.map((template) => (
              <div key={template.id} className="template-card">
                <div className="template-header">
                  <div className="template-icon">
                    {template.template_type === "pdf" ? (
                      <FileText size={24} color="var(--primary-color)" />
                    ) : (
                      <Edit size={24} color="#f59e0b" />
                    )}
                  </div>
                  {template.category && (
                    <span
                      className="category-badge"
                      style={{ backgroundColor: `${getCategoryColor(template.category)}20`, color: getCategoryColor(template.category) }}
                    >
                      {template.category}
                    </span>
                  )}
                </div>

                <h3 className="template-name">{template.name}</h3>
                <p className="template-description">{template.description || 'No description'}</p>

                <div className="template-meta">
                  <span className="template-type">
                    {template.template_type === "pdf" ? "PDF Document" : "Online Form"}
                  </span>
                  <span className={`status-indicator ${template.is_active ? "active" : "inactive"}`}>
                    {template.is_active ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="template-actions">
                  <button className="action-btn" title="Preview">
                    <Eye size={16} />
                  </button>
                  <button className="action-btn" title="Edit">
                    <Edit size={16} />
                  </button>
                  <button className="action-btn danger" title="Delete">
                    <Trash2 size={16} />
                  </button>
                  <Link href={`/dashboard/admin/signing/new?template=${template.id}`} className="send-btn">
                    Send for Signing
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            ))}

            {/* Add Template Card */}
            <div className="template-card add-card" onClick={() => setShowUploadModal(true)}>
              <div className="add-icon">
                <Plus size={32} />
              </div>
              <p>Add New Template</p>
            </div>
          </div>
        )}
      </section>

      {/* Upload Modal - Simplified for now */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Add Document Template</h2>
            <form className="upload-form">
              <div className="form-group">
                <label>Template Name</label>
                <input type="text" placeholder="e.g., Service Agreement" />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea placeholder="Brief description of this document" rows={3} />
              </div>

              <div className="form-group">
                <label>Category</label>
                <select>
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Template Type</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input type="radio" name="type" value="pdf" defaultChecked />
                    <span>PDF Document</span>
                  </label>
                  <label className="radio-label">
                    <input type="radio" name="type" value="online_form" />
                    <span>Online Form</span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Upload PDF</label>
                <div className="file-upload">
                  <Upload size={24} />
                  <p>Drag & drop your PDF here or click to browse</p>
                  <input type="file" accept=".pdf" />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowUploadModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .section-header h2 {
          font-size: 20px;
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

        .templates-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
        }

        .template-card {
          background: white;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-color);
          padding: 24px;
          transition: all 0.2s;
        }

        .template-card:hover {
          box-shadow: var(--shadow-md);
          border-color: var(--primary-color);
        }

        .template-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }

        .template-icon {
          width: 48px;
          height: 48px;
          background: #f8fafc;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .category-badge {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .template-name {
          font-size: 18px;
          margin-bottom: 8px;
        }

        .template-description {
          color: #64748b;
          font-size: 14px;
          line-height: 1.5;
          margin-bottom: 16px;
        }

        .template-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 16px;
          border-top: 1px solid var(--border-color);
          margin-bottom: 16px;
        }

        .template-type {
          font-size: 12px;
          color: #64748b;
        }

        .status-indicator {
          font-size: 11px;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 4px;
        }

        .status-indicator.active {
          background: #ecfdf5;
          color: #059669;
        }

        .status-indicator.inactive {
          background: #fef2f2;
          color: #dc2626;
        }

        .template-actions {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .action-btn {
          width: 36px;
          height: 36px;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          background: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          color: #64748b;
        }

        .action-btn:hover {
          border-color: var(--primary-color);
          color: var(--primary-color);
        }

        .action-btn.danger:hover {
          border-color: #dc2626;
          color: #dc2626;
          background: #fef2f2;
        }

        .send-btn {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 8px 16px;
          background: var(--primary-color);
          color: white;
          border-radius: var(--radius-md);
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s;
        }

        .send-btn:hover {
          opacity: 0.9;
        }

        .add-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 280px;
          border: 2px dashed var(--border-color);
          cursor: pointer;
          color: #64748b;
        }

        .add-card:hover {
          border-color: var(--primary-color);
          color: var(--primary-color);
        }

        .add-icon {
          width: 64px;
          height: 64px;
          background: #f8fafc;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;
        }

        .loading-state {
          text-align: center;
          padding: 48px;
          color: #64748b;
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal-content {
          background: white;
          border-radius: var(--radius-lg);
          padding: 32px;
          max-width: 500px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-content h2 {
          font-size: 24px;
          margin-bottom: 24px;
        }

        .upload-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          font-weight: 600;
          font-size: 14px;
        }

        .form-group input[type="text"],
        .form-group textarea,
        .form-group select {
          padding: 12px 16px;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          font-size: 14px;
        }

        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
          outline: none;
          border-color: var(--primary-color);
        }

        .radio-group {
          display: flex;
          gap: 16px;
        }

        .radio-label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }

        .file-upload {
          border: 2px dashed var(--border-color);
          border-radius: var(--radius-md);
          padding: 32px;
          text-align: center;
          color: #64748b;
          cursor: pointer;
          position: relative;
        }

        .file-upload:hover {
          border-color: var(--primary-color);
        }

        .file-upload input {
          position: absolute;
          inset: 0;
          opacity: 0;
          cursor: pointer;
        }

        .file-upload p {
          margin-top: 8px;
          font-size: 14px;
        }

        .modal-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 8px;
        }

        .btn-secondary {
          padding: 12px 20px;
          background: white;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          font-weight: 600;
          cursor: pointer;
        }

        .btn-secondary:hover {
          background: #f8fafc;
        }
      `}</style>
    </DashboardLayout>
  );
}
