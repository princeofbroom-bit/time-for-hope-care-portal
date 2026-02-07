"use client";

import { useState, useEffect } from "react";
import { getSupabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Heart, Shield, Lock, Mail, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function AdminSignupPage({ params }: { params: { token: string } }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [invite, setInvite] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const router = useRouter();
    const supabase = getSupabase();

    useEffect(() => {
        validateToken();
    }, []);

    const validateToken = async () => {
        try {
            const { data, error } = await supabase
                .from('admin_invites')
                .select('*')
                .eq('token', params.token)
                .eq('used', false)
                .single();

            if (error || !data) {
                setError("Invalid or expired invitation link");
                setLoading(false);
                return;
            }

            // Check if invite has expired
            const expiresAt = new Date(data.expires_at);
            if (expiresAt < new Date()) {
                setError("This invitation has expired");
                setLoading(false);
                return;
            }

            setInvite(data);
            setEmail(data.email);
            setLoading(false);
        } catch (err) {
            setError("Failed to validate invitation");
            setLoading(false);
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            // 1. Create the admin user
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        role: 'admin',
                        full_name: fullName,
                    },
                    emailRedirectTo: `${window.location.origin}/login`,
                },
            });

            if (authError) throw authError;

            if (authData.user) {
                // 2. Mark the invite as used
                await supabase
                    .from('admin_invites')
                    .update({
                        used: true,
                        used_at: new Date().toISOString(),
                    })
                    .eq('token', params.token);

                setSuccess(true);
            }
        } catch (err: any) {
            setError(err.message || "Failed to create admin account");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="container">
                <div className="loading-card">
                    <Loader2 className="spinner" size={40} />
                    <p>Validating invitation...</p>
                </div>
                <style jsx>{`
          .container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            padding: 20px;
          }
          .loading-card {
            background: white;
            padding: 48px;
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-lg);
            text-align: center;
          }
          .spinner {
            animation: spin 1s linear infinite;
            color: var(--secondary-color);
            margin-bottom: 16px;
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
            </div>
        );
    }

    if (error && !invite) {
        return (
            <div className="container">
                <div className="error-card">
                    <AlertCircle size={64} color="var(--error)" />
                    <h1>Invalid Invitation</h1>
                    <p>{error}</p>
                    <Link href="/login" className="btn-primary">Go to Login</Link>
                </div>
                <style jsx>{`
          .container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            padding: 20px;
          }
          .error-card {
            background: white;
            padding: 48px;
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-lg);
            max-width: 500px;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;
          }
          h1 {
            color: var(--primary-color);
            margin: 0;
          }
          p {
            color: #64748b;
            margin: 0;
          }
        `}</style>
            </div>
        );
    }

    if (success) {
        return (
            <div className="container">
                <div className="success-card">
                    <CheckCircle2 size={64} color="#10b981" />
                    <h1>Admin Account Created!</h1>
                    <p>Your administrator account has been successfully created. Please check your email to verify your account.</p>
                    <Link href="/login" className="btn-primary">Go to Login</Link>
                </div>
                <style jsx>{`
          .container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            padding: 20px;
          }
          .success-card {
            background: white;
            padding: 48px;
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-lg);
            max-width: 500px;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;
          }
          h1 {
            color: var(--primary-color);
            margin: 0;
          }
          p {
            color: #64748b;
            margin: 0;
            line-height: 1.6;
          }
        `}</style>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="signup-card">
                <div className="header">
                    <Link href="/" className="logo">
                        <Heart size={32} color="var(--secondary-color)" />
                        <span>Time For Hope</span>
                    </Link>
                    <div className="admin-badge">
                        <Shield size={20} />
                        <span>Administrator Invitation</span>
                    </div>
                    <h1>Complete Your Admin Account</h1>
                    <p>You've been invited to join as an administrator</p>
                </div>

                <form onSubmit={handleSignup} className="signup-form">
                    <div className="input-group">
                        <label htmlFor="fullName">Full Name</label>
                        <div className="input-wrapper">
                            <Shield size={20} />
                            <input
                                id="fullName"
                                type="text"
                                placeholder="John Doe"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label htmlFor="email">Email Address</label>
                        <div className="input-wrapper disabled">
                            <Mail size={20} />
                            <input
                                id="email"
                                type="email"
                                value={email}
                                disabled
                            />
                        </div>
                        <p className="help-text">This email was pre-assigned by your invitation</p>
                    </div>

                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <div className="input-wrapper">
                            <Lock size={20} />
                            <input
                                id="password"
                                type="password"
                                placeholder="Min. 8 characters"
                                minLength={8}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button type="submit" className="btn-primary submit-btn" disabled={submitting}>
                        {submitting ? (
                            <>
                                <Loader2 className="spinner" size={20} />
                                Creating Account...
                            </>
                        ) : (
                            "Create Admin Account"
                        )}
                    </button>
                </form>

                <div className="footer">
                    Already have an account? <Link href="/login">Log In</Link>
                </div>
            </div>

            <style jsx>{`
        .container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
        }

        .signup-card {
          background: white;
          padding: 48px;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
          width: 100%;
          max-width: 500px;
          border: 1px solid var(--border-color);
        }

        .header {
          text-align: center;
          margin-bottom: 32px;
        }

        .logo {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          font-family: var(--font-heading);
          font-size: 24px;
          font-weight: 700;
          color: var(--primary-color);
          margin-bottom: 20px;
          text-decoration: none;
        }

        .admin-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: #f0fdf4;
          border: 1px solid #86efac;
          border-radius: var(--radius-md);
          color: #15803d;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 20px;
        }

        h1 {
          font-size: 28px;
          margin-bottom: 8px;
          color: var(--primary-color);
        }

        p {
          color: #64748b;
          margin: 0;
        }

        .signup-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
        }

        .input-group label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 8px;
          color: var(--primary-color);
        }

        .input-wrapper {
          display: flex;
          align-items: center;
          gap: 12px;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 0 16px;
          transition: border-color 0.2s;
        }

        .input-wrapper:focus-within {
          border-color: var(--secondary-color);
        }

        .input-wrapper.disabled {
          background: #f8fafc;
          cursor: not-allowed;
        }

        .input-wrapper input {
          flex: 1;
          border: none;
          padding: 12px 0;
          outline: none;
          font-size: 16px;
          background: transparent;
        }

        .input-wrapper input:disabled {
          cursor: not-allowed;
        }

        .help-text {
          font-size: 12px;
          color: #94a3b8;
          margin-top: 4px;
        }

        .submit-btn {
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 12px;
          padding: 14px;
          font-size: 16px;
          margin-top: 12px;
        }

        .error-message {
          color: var(--error);
          background: #fef2f2;
          padding: 12px;
          border-radius: var(--radius-md);
          font-size: 14px;
          border: 1px solid #fee2e2;
        }

        .footer {
          text-align: center;
          margin-top: 24px;
          font-size: 14px;
          color: #64748b;
        }

        .footer a {
          font-weight: 600;
          color: var(--secondary-color);
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
}
