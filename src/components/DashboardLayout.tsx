"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { Heart, LayoutDashboard, FileText, GraduationCap, Users, Settings, LogOut, ShieldAlert as ShieldEllipsis, PenTool, Send } from "lucide-react";

export default function DashboardLayout({
  children,
  role = "worker",
  userEmail: initialEmail
}: {
  children: React.ReactNode;
  role?: "admin" | "worker" | "client";
  userEmail?: string | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(initialEmail ?? null);

  useEffect(() => {
    if (initialEmail) return; // Already provided by server layout
    const supabase = getSupabase();
    supabase.auth.getSession().then(({ data }: any) => {
      if (data?.session) {
        setUserEmail(data.session.user.email ?? null);
      }
    });
  }, [initialEmail]);

  const handleLogout = async () => {
    const supabase = getSupabase();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const workerLinks = [
    { href: "/dashboard/worker", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/worker/documents", label: "My Documents", icon: FileText },
    { href: "/dashboard/worker/inductions", label: "Inductions", icon: GraduationCap },
  ];

  const adminLinks = [
    { href: "/dashboard/admin", label: "Admin Overview", icon: LayoutDashboard },
    { href: "/dashboard/admin/workers", label: "Support Workers", icon: Users },
    { href: "/dashboard/admin/documents", label: "Document Templates", icon: FileText },
    { href: "/dashboard/admin/signing", label: "Signing Requests", icon: Send },
    { href: "/dashboard/admin/compliance", label: "Compliance Hub", icon: ShieldEllipsis },
  ];

  const clientLinks = [
    { href: "/dashboard/client", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/client/signing", label: "Sign Documents", icon: PenTool },
    { href: "/dashboard/client/documents", label: "My Documents", icon: FileText },
  ];

  const links = role === "admin" ? adminLinks : role === "client" ? clientLinks : workerLinks;

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <Heart size={24} color="var(--secondary-color)" />
          <span>Time For Hope</span>
        </div>

        <nav className="sidebar-nav">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link ${pathname === link.href ? 'active' : ''}`}
            >
              <link.icon size={20} />
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <Link href="/settings" className="nav-link">
            <Settings size={20} /> Settings
          </Link>
          <button className="nav-link logout-btn" onClick={handleLogout}>
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="user-info">
            {userEmail && <span className="user-email">{userEmail}</span>}
            <span className="user-role">{role === 'admin' ? 'Administrator' : role === 'client' ? 'Client' : 'Support Worker'}</span>
          </div>
        </header>
        <div className="dashboard-content">
          {children}
        </div>
      </main>

      <style jsx>{`
        .dashboard-container {
          display: flex;
          min-height: 100vh;
          background: #f8fafc;
        }

        .sidebar {
          width: 280px;
          background: var(--primary-color);
          color: white;
          display: flex;
          flex-direction: column;
          padding: 24px;
          position: sticky;
          top: 0;
          height: 100vh;
        }

        .sidebar-header {
          display: flex;
          align-items: center;
          gap: 12px;
          font-family: var(--font-heading);
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 48px;
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex: 1;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: var(--radius-md);
          color: rgba(255, 255, 255, 0.7);
          transition: all 0.2s;
          font-weight: 500;
          text-decoration: none;
        }

        .nav-link:hover, .nav-link.active {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .sidebar-footer {
          margin-top: auto;
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding-top: 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .logout-btn {
          width: 100%;
          text-align: left;
          background: transparent;
          cursor: pointer;
        }

        .dashboard-main {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .dashboard-header {
          height: 72px;
          background: white;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          padding: 0 40px;
          justify-content: flex-end;
        }

         .user-info {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .user-email {
          font-size: 14px;
          color: #64748b;
          font-weight: 500;
        }

        .user-role {
          background: var(--accent-color);
          color: var(--primary-color);
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .dashboard-content {
          padding: 40px;
          max-width: var(--container-max);
          width: 100%;
          margin: 0 auto;
        }
      `}</style>
    </div>
  );
}
