"use client";

import { useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Heart, Lock, User, ArrowLeft, Shield, FileText, Users } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = getSupabase();

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          throw new Error(`Database Error: ${profileError.message}`);
        }

        if (!profile) {
          throw new Error("No profile found for your account.");
        }

        const userRole = profile?.role || 'worker';

        document.cookie = `user_role=${userRole}; path=/; max-age=3600; samesite=lax`;

        const dashboardPath = (userRole === 'admin' || userRole === 'super_admin')
          ? '/dashboard/admin'
          : `/dashboard/${userRole}`;

        window.location.href = dashboardPath;
      }
    } catch (err: any) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Left Panel - Branding */}
      <div className="brand-panel">
        <Link href="/" className="back-link">
          <ArrowLeft size={18} /> Back to home
        </Link>

        <div className="brand-content">
          <div className="brand-logo">
            <Heart size={56} strokeWidth={1.5} />
          </div>
          <h1>Time For Hope</h1>
          <p className="brand-subtitle">Care Portal</p>
          <p className="brand-desc">
            NDIS support platform for managing workers, clients, and compliance documents.
          </p>

          <div className="features">
            <div className="feature">
              <div className="feature-icon"><Shield size={20} /></div>
              <div>
                <strong>Secure & Compliant</strong>
                <span>Role-based access with full audit trail</span>
              </div>
            </div>
            <div className="feature">
              <div className="feature-icon"><FileText size={20} /></div>
              <div>
                <strong>Digital Signing</strong>
                <span>Electronic document signing workflows</span>
              </div>
            </div>
            <div className="feature">
              <div className="feature-icon"><Users size={20} /></div>
              <div>
                <strong>Team Management</strong>
                <span>Workers, clients & admin dashboards</span>
              </div>
            </div>
          </div>
        </div>

        <div className="brand-footer">
          &copy; {new Date().getFullYear()} Time For Hope. All rights reserved.
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="form-panel">
        <div className="form-container">
          <div className="form-header">
            <h2>Welcome Back</h2>
            <p>Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            <div className="input-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <User size={18} />
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <Lock size={18} />
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? (
                <span className="loading-state">
                  <span className="spinner" />
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="form-divider">
            <span>New here?</span>
          </div>

          <Link href="/signup" className="signup-link">
            Create an account
          </Link>
        </div>
      </div>

      <style jsx>{`
        .login-page {
          display: flex;
          min-height: 100vh;
        }

        /* Brand Panel */
        .brand-panel {
          flex: 1;
          background: linear-gradient(135deg, var(--primary-color) 0%, #001a3a 50%, var(--secondary-color) 100%);
          color: white;
          padding: 40px;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
        }

        .brand-panel::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle, rgba(0,139,139,0.15) 0%, transparent 60%);
          pointer-events: none;
        }

        .brand-panel::after {
          content: '';
          position: absolute;
          bottom: -30%;
          left: -30%;
          width: 80%;
          height: 80%;
          background: radial-gradient(circle, rgba(0,139,139,0.1) 0%, transparent 60%);
          pointer-events: none;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: rgba(255,255,255,0.7);
          font-size: 14px;
          text-decoration: none;
          transition: color 0.2s;
          position: relative;
          z-index: 1;
        }

        .back-link:hover {
          color: white;
        }

        .brand-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
          z-index: 1;
          max-width: 440px;
        }

        .brand-logo {
          width: 80px;
          height: 80px;
          background: rgba(255,255,255,0.1);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 32px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.15);
        }

        .brand-content h1 {
          font-family: var(--font-heading);
          font-size: 36px;
          font-weight: 700;
          margin-bottom: 4px;
          letter-spacing: -0.5px;
        }

        .brand-subtitle {
          font-size: 18px;
          color: var(--secondary-light);
          font-weight: 500;
          margin-bottom: 16px;
        }

        .brand-desc {
          font-size: 15px;
          color: rgba(255,255,255,0.6);
          line-height: 1.6;
          margin-bottom: 48px;
        }

        .features {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .feature {
          display: flex;
          align-items: flex-start;
          gap: 16px;
        }

        .feature-icon {
          width: 40px;
          height: 40px;
          background: rgba(255,255,255,0.08);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .feature strong {
          display: block;
          font-size: 14px;
          margin-bottom: 2px;
        }

        .feature span {
          font-size: 13px;
          color: rgba(255,255,255,0.5);
        }

        .brand-footer {
          font-size: 13px;
          color: rgba(255,255,255,0.3);
          position: relative;
          z-index: 1;
        }

        /* Form Panel */
        .form-panel {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          background: var(--background);
        }

        .form-container {
          width: 100%;
          max-width: 400px;
        }

        .form-header {
          margin-bottom: 36px;
        }

        .form-header h2 {
          font-family: var(--font-heading);
          font-size: 28px;
          font-weight: 700;
          color: var(--primary-color);
          margin-bottom: 8px;
        }

        .form-header p {
          color: #64748b;
          font-size: 15px;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .input-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          font-size: 13px;
          color: #374151;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .input-wrapper {
          display: flex;
          align-items: center;
          gap: 12px;
          border: 2px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 0 16px;
          transition: all 0.2s;
          background: white;
          color: #94a3b8;
        }

        .input-wrapper:focus-within {
          border-color: var(--secondary-color);
          box-shadow: 0 0 0 3px rgba(0,139,139,0.1);
          color: var(--secondary-color);
        }

        .input-wrapper input {
          flex: 1;
          border: none;
          padding: 14px 0;
          outline: none;
          font-size: 15px;
          background: transparent;
          color: var(--foreground);
        }

        .input-wrapper input::placeholder {
          color: #cbd5e1;
        }

        .login-btn {
          width: 100%;
          padding: 14px;
          background: var(--primary-color);
          color: white;
          border: none;
          border-radius: var(--radius-md);
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 8px;
        }

        .login-btn:hover:not(:disabled) {
          background: var(--primary-light);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,45,98,0.3);
        }

        .login-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .loading-state {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .error-message {
          color: var(--error);
          background: #fef2f2;
          padding: 12px 16px;
          border-radius: var(--radius-md);
          font-size: 14px;
          text-align: center;
          border: 1px solid #fecaca;
        }

        .form-divider {
          display: flex;
          align-items: center;
          gap: 16px;
          margin: 28px 0 20px;
        }

        .form-divider::before,
        .form-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--border-color);
        }

        .form-divider span {
          font-size: 13px;
          color: #94a3b8;
        }

        .signup-link {
          display: block;
          width: 100%;
          padding: 14px;
          text-align: center;
          border: 2px solid var(--border-color);
          border-radius: var(--radius-md);
          color: var(--primary-color);
          font-weight: 600;
          font-size: 15px;
          text-decoration: none;
          transition: all 0.2s;
        }

        .signup-link:hover {
          border-color: var(--secondary-color);
          color: var(--secondary-color);
          background: rgba(0,139,139,0.04);
        }

        /* Responsive */
        @media (max-width: 900px) {
          .login-page {
            flex-direction: column;
          }

          .brand-panel {
            padding: 32px 24px;
            min-height: auto;
          }

          .brand-content {
            max-width: 100%;
          }

          .features {
            display: none;
          }

          .brand-desc {
            margin-bottom: 0;
          }

          .brand-footer {
            display: none;
          }

          .form-panel {
            padding: 32px 24px;
          }
        }
      `}</style>
    </div>
  );
}
