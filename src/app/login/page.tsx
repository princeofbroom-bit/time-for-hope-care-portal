"use client";

import { useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Heart, Lock, User, ArrowLeft } from "lucide-react";
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
      console.log("Step 1: Authenticating...");
      // Step 1: Authenticate the user
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log("Auth result:", { user: data?.user?.id, error: authError });

      if (authError) throw authError;

      if (data.user) {
        console.log("Step 2: Fetching profile for user:", data.user.id);
        // Step 2: Fetch the user's role from the profiles table
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        console.log("Profile result:", { profile, error: profileError });

        if (profileError) {
          throw new Error(`Database Error: ${profileError.message} (${profileError.code})`);
        }

        if (!profile) {
          throw new Error("Login successful, but no profile was found for your account.");
        }

        // Step 3: Redirect based on the user's role
        const userRole = profile?.role || 'worker';
        console.log("Step 3: Redirecting to dashboard for role:", userRole);

        // Cache role in cookie for faster middleware checks
        document.cookie = `user_role=${userRole}; path=/; max-age=3600; samesite=lax`;

        // Both admin and super_admin go to the same dashboard
        const dashboardPath = (userRole === 'admin' || userRole === 'super_admin')
          ? '/dashboard/admin'
          : `/dashboard/${userRole}`;

        console.log("Redirecting to:", dashboardPath);
        window.location.href = dashboardPath;
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Link href="/" className="back-link">
        <ArrowLeft size={20} /> Back to home
      </Link>

      <div className="login-box">
        <div className="login-header">
          <Heart size={48} color="var(--secondary-color)" />
          <h1>Welcome Back</h1>
          <p>Please log in to access your dashboard.</p>
        </div>



        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <User size={20} />
              <input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <Lock size={20} />
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn-primary login-btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="login-footer">
          New to Time For Hope? <Link href="/signup">Create an account</Link>
        </div>
      </div>

      <style jsx>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--accent-color);
          padding: 24px;
          position: relative;
        }

        .back-link {
          position: absolute;
          top: 24px;
          left: 24px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          color: var(--primary-color);
        }

        .login-box {
          background: white;
          padding: 48px;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
          width: 100%;
          max-width: 480px;
        }

        .login-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .login-header h1 {
          margin: 16px 0 8px;
        }

        .login-header p {
          color: #64748b;
        }

        .role-selector {
          display: flex;
          gap: 12px;
          margin-bottom: 32px;
          background: #f1f5f9;
          padding: 6px;
          border-radius: var(--radius-md);
        }

        .role-selector button {
          flex: 1;
          padding: 10px;
          border-radius: var(--radius-sm);
          font-size: 14px;
          background: transparent;
          color: #64748b;
          transition: all 0.2s;
        }

        .role-selector button.active {
          background: white;
          color: var(--primary-color);
          box-shadow: var(--shadow-sm);
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .input-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          font-size: 14px;
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

        .input-wrapper input {
          flex: 1;
          border: none;
          padding: 12px 0;
          outline: none;
          font-size: 16px;
        }

        .login-btn {
          width: 100%;
          margin-top: 8px;
        }

        .error-message {
            color: var(--error);
            background: #fef2f2;
            padding: 12px;
            border-radius: var(--radius-md);
            font-size: 14px;
            text-align: center;
            border: 1px solid #fee2e2;
        }

        .login-footer {
            text-align: center;
            margin-top: 24px;
            font-size: 14px;
            color: #64748b;
        }

        .login-footer a {
            font-weight: 600;
            color: var(--secondary-color);
        }
      `}</style>
    </div>
  );
}
