import DashboardLayout from "@/components/DashboardLayout";

export default function WorkerDashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout role="worker">{children}</DashboardLayout>;
}
