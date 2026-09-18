import { createFileRoute } from "@tanstack/react-router";
import { AdminDashboard } from "@/components/dashboards/AdminDashboard";

export const Route = createFileRoute("/_authenticated/admin/dashboard")({
  component: AdminDashboard,
});
