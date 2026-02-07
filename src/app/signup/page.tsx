"use client";

import { useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { Heart, User, Shield, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function SignupPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState<"worker" | "client">("client");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const supabase = getSupabase();

        try {
            // 1. Sign up user
            const { data, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        role: role,
                    },
                    emailRedirectTo: `${window.location.origin}/login`,
                },
            });

            if (authError) throw authError;

            if (data.user) {
                setSubmitted(true);
            }
        } catch (err: any) {
            setError(err.message || "An error occurred during signup");
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="auth-container">
                <div className="auth-card success">
                    <CheckCircle2 size={64} color="var(--success)" />
                    <h1>Verify Your Email</h1>
                    <p>We've sent a verification link to <strong>{email}</strong>. Please check your inbox (and spam folder) to complete your registration.</p>
                    <Link href="/login" className="btn-primary">Go to Login</Link>
                </div>
                <style jsx>{`
                    .auth-container {
                        min-height: 100vh;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: #f8fafc;
                        padding: 20px;
                    }
                    .auth-card {
                        background: white;
                        padding: 48px;
                        border-radius: var(--radius-lg);
                        box-shadow: var(--shadow-lg);
                        max-width: 500px;
                        width: 100%;
                        text-align: center;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: 24px;
                    }
                    h1 { font-family: var(--font-heading); color: var(--primary-color); }
                    p { color: #64748b; line-height: 1.6; }
                `}</style>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <Link href="/" className="logo">
                        <Heart size={32} color="var(--secondary-color)" />
                        <span>Time For Hope</span>
                    </Link>
                    <h1>Create Your Account</h1>
                    <p>Join the NDIS & Aged Care management platform</p>
                </div>

                <form onSubmit={handleSignup} className="auth-form">
                    <div className="role-selector">
                        <button
                            type="button"
                            className={`role-btn ${role === 'client' ? 'active' : ''}`}
                            onClick={() => setRole('client')}
                        >
                            <Heart size={20} />
                            <span>Client</span>
                        </button>
                        <button
                            type="button"
                            className={`role-btn ${role === 'worker' ? 'active' : ''}`}
                            onClick={() => setRole('worker')}
                        >
                            <User size={20} />
                            <span>Support Worker</span>
                        </button>
                    </div>

                    <div className="input-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            required
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="input-group">
                        <label>Password</label>
                        <input
                            type="password"
                            required
                            placeholder="Min. 8 characters"
                            minLength={8}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button type="submit" className="btn-primary submit-btn" disabled={loading}>
                        {loading ? <Loader2 className="spinner" size={20} /> : "Sign Up"}
                        {!loading && <ArrowRight size={20} />}
                    </button>
                </form>

                <div className="auth-footer">
                    Already have an account? <Link href="/login">Log In</Link>
                </div>
            </div>

            <style jsx>{`
                .auth-container {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 40px 20px;
                    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                }

                .auth-card {
                    background: white;
                    padding: 48px;
                    border-radius: var(--radius-lg);
                    box-shadow: var(--shadow-lg);
                    width: 100%;
                    max-width: 480px;
                    border: 1px solid var(--border-color);
                }

                .auth-header {
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
                    margin-bottom: 24px;
                }

                h1 {
                    font-size: 28px;
                    margin-bottom: 8px;
                }

                p {
                    color: #64748b;
                }

                .role-selector {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                    margin-bottom: 24px;
                }

                .role-btn {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                    padding: 16px;
                    border: 2px solid var(--border-color);
                    border-radius: var(--radius-md);
                    background: white;
                    cursor: pointer;
                    transition: all 0.2s;
                    color: #64748b;
                }

                .role-btn.active {
                    border-color: var(--secondary-color);
                    background: #f0fdfa;
                    color: var(--secondary-color);
                }

                .role-btn span {
                    font-size: 13px;
                    font-weight: 600;
                }

                .input-group {
                    margin-bottom: 20px;
                }

                .input-group label {
                    display: block;
                    font-size: 14px;
                    font-weight: 600;
                    margin-bottom: 8px;
                    color: var(--primary-color);
                }

                .input-group input {
                    width: 100%;
                    padding: 12px 16px;
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-md);
                    font-size: 16px;
                    transition: border-color 0.2s;
                }

                .input-group input:focus {
                    outline: none;
                    border-color: var(--secondary-color);
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
                    margin-bottom: 20px;
                    border: 1px solid #fee2e2;
                }

                .auth-footer {
                    text-align: center;
                    margin-top: 24px;
                    font-size: 14px;
                    color: #64748b;
                }

                .auth-footer a {
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
