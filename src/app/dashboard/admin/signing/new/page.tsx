"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { getSupabase } from "@/lib/supabase";
import {
  ArrowLeft,
  Send,
  FileText,
  User,
  Mail,
  Calendar,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { CardGridSkeleton, SkeletonStyles } from "@/components/SkeletonLoader";

interface DocumentTemplate {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  template_type: string;
}

function NewSigningRequestContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedTemplate = searchParams.get('template');

  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    templateId: preselectedTemplate || "",
    recipientName: "",
    recipientEmail: "",
    recipientPhone: "",
    expiryDays: "30",
    sendEmail: true,
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    if (preselectedTemplate) {
      setFormData(prev => ({ ...prev, templateId: preselectedTemplate }));
    }
  }, [preselectedTemplate]);

  const fetchTemplates = async () => {
    const supabase = getSupabase();

    try {
      const { data, error } = await supabase
        .from('document_templates')
        .select('id, name, description, category, template_type')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setTemplates(data || []);
    } catch (err) {
      console.error('Error fetching templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateAccessToken = () => {
    return crypto.randomUUID() + '-' + Date.now().toString(36);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const supabase = getSupabase();

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Calculate expiry date
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + parseInt(formData.expiryDays));

      // Create signing request
      const { data, error: insertError } = await supabase
        .from('signing_requests')
        .insert({
          template_id: formData.templateId,
          recipient_name: formData.recipientName,
          recipient_email: formData.recipientEmail,
          recipient_phone: formData.recipientPhone || null,
          access_token: generateAccessToken(),
          access_method: 'email_link',
          status: formData.sendEmail ? 'sent' : 'pending',
          expires_at: expiresAt.toISOString(),
          sent_at: formData.sendEmail ? new Date().toISOString() : null,
          sent_by: user.id,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // TODO: Send email notification if sendEmail is true

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard/admin/signing');
      }, 2000);

    } catch (err: any) {
      console.error('Error creating signing request:', err);
      setError(err.message || 'Failed to create signing request');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedTemplate = templates.find(t => t.id === formData.templateId);

  return (
    <>
      <div className="page-header">
        <Link href="/dashboard/admin/signing" className="back-link">
          <ArrowLeft size={20} />
          Back to Signing Requests
        </Link>
        <h1>New Signing Request</h1>
        <p>Send a document for signature</p>
      </div>

      {success ? (
        <div className="success-card">
          <CheckCircle size={48} color="#10b981" />
          <h2>Request Created Successfully!</h2>
          <p>The signing request has been created and {formData.sendEmail ? 'sent to' : 'is ready for'} the recipient.</p>
          <p className="redirect-text">Redirecting to signing requests...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="form-container">
          {error && (
            <div className="error-banner">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          {/* Template Selection */}
          <section className="form-section">
            <h2><FileText size={20} /> Select Document</h2>
            {loading ? (
              <><CardGridSkeleton count={3} /><SkeletonStyles /></>
            ) : templates.length === 0 ? (
              <div className="empty-text">
                No document templates available. <Link href="/dashboard/admin/documents">Create one first</Link>.
              </div>
            ) : (
              <div className="template-grid">
                {templates.map((template) => (
                  <label
                    key={template.id}
                    className={`template-card ${formData.templateId === template.id ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="templateId"
                      value={template.id}
                      checked={formData.templateId === template.id}
                      onChange={(e) => setFormData({ ...formData, templateId: e.target.value })}
                      required
                    />
                    <div className="template-content">
                      <h3>{template.name}</h3>
                      {template.description && <p>{template.description}</p>}
                      <span className="template-type">{template.template_type}</span>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </section>

          {/* Recipient Details */}
          <section className="form-section">
            <h2><User size={20} /> Recipient Details</h2>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="recipientName">Full Name *</label>
                <input
                  id="recipientName"
                  type="text"
                  value={formData.recipientName}
                  onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                  placeholder="John Smith"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="recipientEmail">Email Address *</label>
                <input
                  id="recipientEmail"
                  type="email"
                  value={formData.recipientEmail}
                  onChange={(e) => setFormData({ ...formData, recipientEmail: e.target.value })}
                  placeholder="john@example.com"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="recipientPhone">Phone (Optional)</label>
                <input
                  id="recipientPhone"
                  type="tel"
                  value={formData.recipientPhone}
                  onChange={(e) => setFormData({ ...formData, recipientPhone: e.target.value })}
                  placeholder="+61 400 000 000"
                />
              </div>
              <div className="form-group">
                <label htmlFor="expiryDays">Expires In</label>
                <select
                  id="expiryDays"
                  value={formData.expiryDays}
                  onChange={(e) => setFormData({ ...formData, expiryDays: e.target.value })}
                >
                  <option value="7">7 days</option>
                  <option value="14">14 days</option>
                  <option value="30">30 days</option>
                  <option value="60">60 days</option>
                  <option value="90">90 days</option>
                </select>
              </div>
            </div>
          </section>

          {/* Options */}
          <section className="form-section">
            <h2><Mail size={20} /> Options</h2>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.sendEmail}
                onChange={(e) => setFormData({ ...formData, sendEmail: e.target.checked })}
              />
              <span>Send email notification to recipient</span>
            </label>
          </section>

          {/* Submit */}
          <div className="form-actions">
            <Link href="/dashboard/admin/signing" className="btn-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting || !formData.templateId}
            >
              {submitting ? (
                'Creating...'
              ) : (
                <>
                  <Send size={18} />
                  Create Request
                </>
              )}
            </button>
          </div>
        </form>
      )}

      <style jsx>{`
        .page-header {
          margin-bottom: 40px;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #64748b;
          text-decoration: none;
          font-size: 14px;
          margin-bottom: 16px;
        }

        .back-link:hover {
          color: var(--primary-color);
        }

        .page-header h1 {
          font-size: 32px;
          margin-bottom: 8px;
        }

        .page-header p {
          color: #64748b;
        }

        .form-container {
          max-width: 800px;
        }

        .error-banner {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: #fef2f2;
          border: 1px solid #fee2e2;
          border-radius: var(--radius-md);
          color: #dc2626;
          margin-bottom: 24px;
        }

        .form-section {
          background: white;
          padding: 24px;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-color);
          margin-bottom: 24px;
        }

        .form-section h2 {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 18px;
          margin-bottom: 20px;
          color: var(--primary-color);
        }

        .loading-text, .empty-text {
          color: #64748b;
          text-align: center;
          padding: 24px;
        }

        .empty-text a {
          color: var(--secondary-color);
        }

        .template-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 16px;
        }

        .template-card {
          position: relative;
          padding: 20px;
          border: 2px solid var(--border-color);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all 0.2s;
        }

        .template-card:hover {
          border-color: var(--secondary-color);
        }

        .template-card.selected {
          border-color: var(--secondary-color);
          background: #f0fdf4;
        }

        .template-card input {
          position: absolute;
          opacity: 0;
        }

        .template-content h3 {
          font-size: 15px;
          margin-bottom: 6px;
        }

        .template-content p {
          font-size: 13px;
          color: #64748b;
          margin-bottom: 8px;
        }

        .template-type {
          font-size: 11px;
          padding: 3px 8px;
          background: #f1f5f9;
          border-radius: 10px;
          color: #64748b;
          text-transform: uppercase;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          font-size: 14px;
          font-weight: 500;
        }

        .form-group input,
        .form-group select {
          padding: 12px 16px;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          font-size: 14px;
          transition: border-color 0.2s;
        }

        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: var(--secondary-color);
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
        }

        .checkbox-label input {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .checkbox-label span {
          font-size: 14px;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 16px;
          margin-top: 32px;
        }

        .btn-primary {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: var(--primary-color);
          color: white;
          border: none;
          border-radius: var(--radius-md);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary:hover:not(:disabled) {
          opacity: 0.9;
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-secondary {
          padding: 12px 24px;
          background: white;
          color: var(--primary-color);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s;
        }

        .btn-secondary:hover {
          border-color: var(--primary-color);
        }

        .success-card {
          max-width: 500px;
          margin: 0 auto;
          text-align: center;
          padding: 48px;
          background: white;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-color);
        }

        .success-card h2 {
          margin: 20px 0 12px;
          color: #10b981;
        }

        .success-card p {
          color: #64748b;
        }

        .redirect-text {
          margin-top: 20px;
          font-size: 13px;
        }

        @media (max-width: 640px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}

export default function NewSigningRequestPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewSigningRequestContent />
    </Suspense>
  );
}
