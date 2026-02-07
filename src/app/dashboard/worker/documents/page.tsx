"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Upload, FileCheck, AlertCircle, Clock } from "lucide-react";

const REQUIRED_DOCS = [
  { id: "police_check", label: "Police Check", description: "Must be issued within the last 12 months." },
  { id: "first_aid", label: "First Aid Certificate", description: "HLTAID011 or equivalent." },
  { id: "cpr", label: "CPR Certificate", description: "Current annual refresher required." },
  { id: "wwcc", label: "Working with Children Check", description: "Valid state-based clearance." },
];

export default function DocumentUploadPage() {
  const [docs, setDocs] = useState<Record<string, { status: 'pending' | 'uploading' | 'uploaded' | 'approved', file?: string, error?: string }>>({
    police_check: { status: 'pending' },
    first_aid: { status: 'uploaded', file: 'first_aid_cert.pdf' },
    cpr: { status: 'pending' },
    wwcc: { status: 'pending' },
  });

  const triggerUpload = (id: string) => {
    const input = document.getElementById(`file-input-${id}`) as HTMLInputElement;
    input?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Set state to uploading
    setDocs(prev => ({
      ...prev,
      [id]: { status: 'uploading' }
    }));

    const formData = new FormData();
    formData.append("file", file);
    formData.append("docId", id);
    formData.append("userId", "worker_001"); // Mock user ID for now

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (res.ok) {
        setDocs(prev => ({
          ...prev,
          [id]: { status: 'uploaded', file: file.name }
        }));
      } else {
        setDocs(prev => ({
          ...prev,
          [id]: { status: 'pending', error: result.error }
        }));
        alert(`Upload failed: ${result.error}`);
      }
    } catch (error) {
      setDocs(prev => ({
        ...prev,
        [id]: { status: 'pending', error: "Network error" }
      }));
      alert("Upload failed. Please check your connection.");
    }
  };

  return (
    <DashboardLayout role="worker">
      <div className="page-header">
        <h1>My Documents</h1>
        <p>Ensure all compliance documents are uploaded and valid (Max 50MB).</p>
      </div>

      <div className="doc-grid">
        {REQUIRED_DOCS.map((doc) => {
          const docState = docs[doc.id];
          const status = docState?.status;

          return (
            <div key={doc.id} className={`doc-card ${status}`}>
              <div className="doc-info">
                <div className="doc-icon">
                  {status === 'approved' ? (
                    <FileCheck size={24} color="var(--success)" />
                  ) : status === 'uploaded' || status === 'uploading' ? (
                    <Clock size={24} color="var(--secondary-color)" />
                  ) : (
                    <AlertCircle size={24} color="var(--error)" />
                  )}
                </div>
                <div>
                  <h3>{doc.label}</h3>
                  <p>{doc.description}</p>
                  {docState.error && <p className="error-text">{docState.error}</p>}
                </div>
              </div>

              <div className="doc-action">
                {status === 'uploading' ? (
                  <div className="loading-spinner">Uploading...</div>
                ) : status === 'pending' ? (
                  <>
                    <input
                      type="file"
                      id={`file-input-${doc.id}`}
                      style={{ display: 'none' }}
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={(e) => handleFileChange(e, doc.id)}
                    />
                    <button className="upload-btn" onClick={() => triggerUpload(doc.id)}>
                      <Upload size={18} /> Upload File
                    </button>
                  </>
                ) : (
                  <div className="status-badge">
                    {status === 'uploaded' ? 'Awaiting Review' : 'Verified'}
                  </div>
                )}
              </div>
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

        .doc-grid {
          display: grid;
          gap: 24px;
        }

        .doc-card {
          background: white;
          padding: 24px;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-color);
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: transform 0.2s;
        }

        .doc-card:hover {
          transform: translateX(4px);
        }

        .doc-info {
          display: flex;
          gap: 20px;
          align-items: center;
        }

        .doc-icon {
          width: 48px;
          height: 48px;
          background: #f8fafc;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .doc-card h3 {
          font-size: 18px;
          margin-bottom: 4px;
        }

        .doc-card p {
          font-size: 14px;
          color: #64748b;
        }

        .upload-btn {
          background: var(--primary-color);
          color: white;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          font-size: 14px;
        }

        .status-badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          background: #f1f5f9;
          color: #64748b;
        }

        .doc-card.uploaded .status-badge {
          background: #ecfdf5;
          color: #059669;
        }

        .doc-card.approved .status-badge {
          background: var(--success);
          color: white;
        }
      `}</style>
    </DashboardLayout>
  );
}
