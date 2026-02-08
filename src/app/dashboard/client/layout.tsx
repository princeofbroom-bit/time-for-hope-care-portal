import DashboardLayout from "@/components/DashboardLayout";

export default function ClientDashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout role="client">{children}</DashboardLayout>;
}
