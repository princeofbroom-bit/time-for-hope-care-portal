"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import SignaturePad from "@/components/signing/SignaturePad";
import { TypedSignature } from "@/components/signing/SignaturePad";
import {
  FileText,
  CheckCircle,
  AlertCircle,
  Clock,
  Shield,
  ChevronLeft,
  ChevronRight,
  Pen,
  Type,
  X,
} from "lucide-react";

interface SigningRequestData {
  id: string;
  template_name: string;
  template_description: string;
  recipient_name: string;
  recipient_email: string;
  status: string;
  expires_at: string | null;
  document_url: string | null;
}

type SignatureMode = "draw" | "type";
type PageState = "loading" | "error" | "signing" | "complete" | "expired";

export default function PublicSigningPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [pageState, setPageState] = useState<PageState>("loading");
  const [request, setRequest] = useState<SigningRequestData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [signatureMode, setSignatureMode] = useState<SignatureMode>("draw");
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [typedName, setTypedName] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Mock data fetch - replace with actual API call
  useEffect(() => {
    const fetchSigningRequest = async () => {
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mock data
        const mockRequest: SigningRequestData = {
          id: "123",
          template_name: "Service Agreement",
          template_description:
            "This is the service agreement between Time For Hope and the participant for NDIS services.",
          recipient_name: "John Smith",
          recipient_email: "john.smith@email.com",
          status: "pending",
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          document_url: null,
        };

        // Check if expired
        if (mockRequest.expires_at && new Date(mockRequest.expires_at) < new Date()) {
          setPageState("expired");
          return;
        }

        // Check if already signed
        if (mockRequest.status === "signed") {
          setPageState("complete");
          return;
        }

        setRequest(mockRequest);
        setTypedName(mockRequest.recipient_name);
        setPageState("signing");
      } catch (err) {
        setError("Unable to load signing request. Please try again or contact support.");
        setPageState("error");
      }
    };

    fetchSigningRequest();
  }, [token]);

  const handleSignatureChange = (dataUrl: string | null) => {
    setSignatureData(dataUrl);
  };

  const handleTypedSignatureGenerate = (dataUrl: string) => {
    setSignatureData(dataUrl);
  };

  const handleSubmitSignature = async () => {
    if (!signatureData || !agreedToTerms) return;

    setSubmitting(true);

    try {
      // Simulate API call to submit signature
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // In real implementation:
      // await fetch(`/api/documents/sign/${token}/submit`, {
      //   method: 'POST',
      //   body: JSON.stringify({ signature: signatureData }),
      // });

      setPageState("complete");
    } catch (err) {
      setError("Failed to submit signature. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    { number: 1, title: "Review Document" },
    { number: 2, title: "Add Signature" },
    { number: 3, title: "Confirm" },
  ];

  // Loading state
  if (pageState === "loading") {
    return (
      <div className="page-container">
        <div className="loading-card">
          <div className="spinner" />
          <h2>Loading document...</h2>
          <p>Please wait while we prepare your document for signing.</p>
        </div>
        <style jsx>{`
          .page-container {
            min-height: 100vh;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }

          .loading-card {
            background: white;
            border-radius: 16px;
            padding: 48px;
            text-align: center;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          }

          .spinner {
            width: 48px;
            height: 48px;
            border: 4px solid #e2e8f0;
            border-top-color: #002d62;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 24px;
          }

          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }

          h2 {
            margin-bottom: 8px;
          }

          p {
            color: #64748b;
          }
        `}</style>
      </div>
    );
  }

  // Error state
  if (pageState === "error") {
    return (
      <div className="page-container">
        <div className="error-card">
          <AlertCircle size={48} color="#ef4444" />
          <h2>Something went wrong</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
        <style jsx>{`
          .page-container {
            min-height: 100vh;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }

          .error-card {
            background: white;
            border-radius: 16px;
            padding: 48px;
            text-align: center;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            max-width: 400px;
          }

          h2 {
            margin: 24px 0 8px;
          }

          p {
            color: #64748b;
            margin-bottom: 24px;
          }

          button {
            padding: 12px 24px;
            background: #002d62;
            color: white;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
          }
        `}</style>
      </div>
    );
  }

  // Expired state
  if (pageState === "expired") {
    return (
      <div className="page-container">
        <div className="expired-card">
          <Clock size={48} color="#f59e0b" />
          <h2>Link Expired</h2>
          <p>This signing link has expired. Please contact the sender to request a new link.</p>
        </div>
        <style jsx>{`
          .page-container {
            min-height: 100vh;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }

          .expired-card {
            background: white;
            border-radius: 16px;
            padding: 48px;
            text-align: center;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            max-width: 400px;
          }

          h2 {
            margin: 24px 0 8px;
          }

          p {
            color: #64748b;
          }
        `}</style>
      </div>
    );
  }

  // Complete state
  if (pageState === "complete") {
    return (
      <div className="page-container">
        <div className="success-card">
          <div className="success-icon">
            <CheckCircle size={64} color="#10b981" />
          </div>
          <h2>Document Signed Successfully!</h2>
          <p>
            Thank you for signing <strong>{request?.template_name}</strong>. A copy of the signed
            document will be sent to your email address.
          </p>

          <div className="info-box">
            <Shield size={20} />
            <div>
              <strong>Legally Binding</strong>
              <p>Your signature has been recorded with a full audit trail for legal compliance.</p>
            </div>
          </div>

          <p className="email-notice">
            Check your inbox at <strong>{request?.recipient_email}</strong>
          </p>
        </div>
        <style jsx>{`
          .page-container {
            min-height: 100vh;
            background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }

          .success-card {
            background: white;
            border-radius: 16px;
            padding: 48px;
            text-align: center;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            max-width: 500px;
          }

          .success-icon {
            animation: bounce 0.5s ease;
          }

          @keyframes bounce {
            0%,
            100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.1);
            }
          }

          h2 {
            margin: 24px 0 16px;
            color: #10b981;
          }

          p {
            color: #64748b;
            line-height: 1.6;
          }

          .info-box {
            display: flex;
            gap: 16px;
            text-align: left;
            padding: 20px;
            background: #f8fafc;
            border-radius: 12px;
            margin: 24px 0;
          }

          .info-box strong {
            display: block;
            margin-bottom: 4px;
          }

          .info-box p {
            font-size: 14px;
            margin: 0;
          }

          .email-notice {
            font-size: 14px;
            padding-top: 16px;
            border-top: 1px solid #e2e8f0;
            margin-top: 24px;
          }
        `}</style>
      </div>
    );
  }

  // Main signing flow
  return (
    <div className="signing-page">
      {/* Header */}
      <header className="signing-header">
        <div className="logo">
          <FileText size={24} />
          <span>Time For Hope</span>
        </div>
        <div className="security-badge">
          <Shield size={16} />
          Secure Signing
        </div>
      </header>

      {/* Progress Steps */}
      <div className="progress-container">
        <div className="progress-steps">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className={`step ${currentStep >= step.number ? "active" : ""} ${
                currentStep > step.number ? "completed" : ""
              }`}
            >
              <div className="step-number">
                {currentStep > step.number ? <CheckCircle size={16} /> : step.number}
              </div>
              <span className="step-title">{step.title}</span>
              {index < steps.length - 1 && <div className="step-line" />}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="signing-content">
        <div className="document-info">
          <h1>{request?.template_name}</h1>
          <p className="recipient-info">
            Signing as: <strong>{request?.recipient_name}</strong> ({request?.recipient_email})
          </p>
        </div>

        {/* Step 1: Review Document */}
        {currentStep === 1 && (
          <div className="step-content">
            <div className="document-preview">
              <div className="preview-placeholder">
                <FileText size={64} color="#94a3b8" />
                <h3>Document Preview</h3>
                <p>{request?.template_description}</p>
                <p className="preview-note">
                  In production, the actual document will be displayed here for review.
                </p>
              </div>
            </div>

            <div className="step-actions">
              <button className="btn-primary" onClick={() => setCurrentStep(2)}>
                Continue to Sign
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Add Signature */}
        {currentStep === 2 && (
          <div className="step-content">
            <div className="signature-section">
              <h2>Add Your Signature</h2>

              <div className="signature-mode-tabs">
                <button
                  className={`mode-tab ${signatureMode === "draw" ? "active" : ""}`}
                  onClick={() => {
                    setSignatureMode("draw");
                    setSignatureData(null);
                  }}
                >
                  <Pen size={18} />
                  Draw Signature
                </button>
                <button
                  className={`mode-tab ${signatureMode === "type" ? "active" : ""}`}
                  onClick={() => {
                    setSignatureMode("type");
                    setSignatureData(null);
                  }}
                >
                  <Type size={18} />
                  Type Signature
                </button>
              </div>

              <div className="signature-input">
                {signatureMode === "draw" ? (
                  <SignaturePad
                    onSignatureChange={handleSignatureChange}
                    width={Math.min(500, typeof window !== "undefined" ? window.innerWidth - 80 : 500)}
                    height={200}
                  />
                ) : (
                  <TypedSignature
                    name={typedName}
                    onNameChange={setTypedName}
                    onSignatureGenerate={handleTypedSignatureGenerate}
                  />
                )}
              </div>
            </div>

            <div className="step-actions">
              <button className="btn-secondary" onClick={() => setCurrentStep(1)}>
                <ChevronLeft size={18} />
                Back
              </button>
              <button
                className="btn-primary"
                onClick={() => setCurrentStep(3)}
                disabled={!signatureData}
              >
                Review & Confirm
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {currentStep === 3 && (
          <div className="step-content">
            <div className="confirmation-section">
              <h2>Confirm Your Signature</h2>

              <div className="signature-preview-box">
                <h4>Your Signature</h4>
                {signatureData && (
                  <img src={signatureData} alt="Your signature" className="signature-preview-img" />
                )}
              </div>

              <div className="terms-checkbox">
                <input
                  type="checkbox"
                  id="agree-terms"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                />
                <label htmlFor="agree-terms">
                  I agree that this electronic signature is the legal equivalent of my manual
                  signature on this document. I consent to be legally bound by this document.
                </label>
              </div>

              <div className="legal-notice">
                <Shield size={16} />
                <p>
                  By clicking &ldquo;Sign Document&rdquo;, you are signing this document
                  electronically. Your signature, IP address, and timestamp will be recorded as part
                  of the legally binding audit trail.
                </p>
              </div>
            </div>

            <div className="step-actions">
              <button className="btn-secondary" onClick={() => setCurrentStep(2)}>
                <ChevronLeft size={18} />
                Back
              </button>
              <button
                className="btn-primary submit-btn"
                onClick={handleSubmitSignature}
                disabled={!agreedToTerms || submitting}
              >
                {submitting ? (
                  <>
                    <span className="btn-spinner" />
                    Signing...
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} />
                    Sign Document
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="signing-footer">
        <p>Powered by Time For Hope | Secure Document Signing</p>
      </footer>

      <style jsx>{`
        .signing-page {
          min-height: 100vh;
          background: #f8fafc;
          display: flex;
          flex-direction: column;
        }

        .signing-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          background: white;
          border-bottom: 1px solid #e2e8f0;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 700;
          font-size: 18px;
          color: #002d62;
        }

        .security-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: #ecfdf5;
          color: #059669;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 500;
        }

        .progress-container {
          background: white;
          padding: 24px;
          border-bottom: 1px solid #e2e8f0;
        }

        .progress-steps {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          max-width: 600px;
          margin: 0 auto;
        }

        .step {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .step-number {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #e2e8f0;
          color: #64748b;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 600;
        }

        .step.active .step-number {
          background: #002d62;
          color: white;
        }

        .step.completed .step-number {
          background: #10b981;
          color: white;
        }

        .step-title {
          font-size: 14px;
          color: #64748b;
        }

        .step.active .step-title {
          color: #002d62;
          font-weight: 500;
        }

        .step-line {
          width: 40px;
          height: 2px;
          background: #e2e8f0;
        }

        .step.completed + .step .step-line,
        .step.completed .step-line {
          background: #10b981;
        }

        .signing-content {
          flex: 1;
          max-width: 800px;
          width: 100%;
          margin: 0 auto;
          padding: 32px 24px;
        }

        .document-info {
          text-align: center;
          margin-bottom: 32px;
        }

        .document-info h1 {
          font-size: 28px;
          margin-bottom: 8px;
        }

        .recipient-info {
          color: #64748b;
        }

        .step-content {
          background: white;
          border-radius: 16px;
          padding: 32px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }

        .document-preview {
          min-height: 400px;
          border: 2px dashed #e2e8f0;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .preview-placeholder {
          text-align: center;
          color: #64748b;
          padding: 40px;
        }

        .preview-placeholder h3 {
          margin: 16px 0 8px;
        }

        .preview-note {
          font-size: 13px;
          font-style: italic;
          margin-top: 16px;
        }

        .step-actions {
          display: flex;
          justify-content: space-between;
          margin-top: 24px;
          gap: 16px;
        }

        .btn-primary,
        .btn-secondary {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 14px 24px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary {
          background: #002d62;
          color: white;
          border: none;
          margin-left: auto;
        }

        .btn-primary:hover:not(:disabled) {
          background: #003d82;
        }

        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: white;
          color: #64748b;
          border: 1px solid #e2e8f0;
        }

        .btn-secondary:hover {
          background: #f8fafc;
        }

        .signature-section h2 {
          margin-bottom: 24px;
        }

        .signature-mode-tabs {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
        }

        .mode-tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }

        .mode-tab:hover {
          border-color: #002d62;
        }

        .mode-tab.active {
          border-color: #002d62;
          background: #f0f4ff;
          color: #002d62;
        }

        .signature-input {
          padding: 24px;
          background: #f8fafc;
          border-radius: 12px;
        }

        .confirmation-section h2 {
          margin-bottom: 24px;
        }

        .signature-preview-box {
          padding: 24px;
          background: #f8fafc;
          border-radius: 12px;
          margin-bottom: 24px;
        }

        .signature-preview-box h4 {
          margin-bottom: 16px;
          color: #64748b;
          font-size: 14px;
        }

        .signature-preview-img {
          max-width: 100%;
          max-height: 100px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: white;
        }

        .terms-checkbox {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
        }

        .terms-checkbox input {
          margin-top: 4px;
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .terms-checkbox label {
          font-size: 14px;
          line-height: 1.5;
          color: #475569;
          cursor: pointer;
        }

        .legal-notice {
          display: flex;
          gap: 12px;
          padding: 16px;
          background: #fef3c7;
          border-radius: 8px;
          font-size: 13px;
          color: #92400e;
        }

        .legal-notice p {
          margin: 0;
          line-height: 1.5;
        }

        .submit-btn {
          background: #10b981;
        }

        .submit-btn:hover:not(:disabled) {
          background: #059669;
        }

        .btn-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .signing-footer {
          padding: 16px;
          text-align: center;
          color: #94a3b8;
          font-size: 13px;
          border-top: 1px solid #e2e8f0;
        }

        @media (max-width: 640px) {
          .progress-steps {
            flex-wrap: wrap;
          }

          .step-line {
            display: none;
          }

          .step-actions {
            flex-direction: column;
          }

          .btn-primary {
            margin-left: 0;
          }

          .btn-secondary {
            order: 2;
          }

          .signature-mode-tabs {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
