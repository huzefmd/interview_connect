import { createFileRoute } from "@tanstack/react-router";
import { useUser, useMyRole } from "@/hooks/useAuth";
import { StudentDashboard } from "@/components/dashboards/StudentDashboard";
import { CollegeDashboard } from "@/components/dashboards/CollegeDashboard";
import { EmployerDashboard } from "@/components/dashboards/EmployerDashboard";
import { AdminDashboard } from "@/components/dashboards/AdminDashboard";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Your JobSync dashboard" },
      { name: "description", content: "Track applications, interviews and placements in one place." },
      { property: "og:title", content: "Your JobSync dashboard" },
      { property: "og:description", content: "Track applications, interviews and placements in one place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user } = useUser();
  const { data: role, isLoading } = useMyRole(user?.id);

  if (!user || isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (role === "student") return <StudentDashboard userId={user.id} />;
  if (role === "university") return <CollegeDashboard userId={user.id} />;
  if (role === "employer") return <EmployerDashboard userId={user.id} />;
  if (role === "admin") return <AdminDashboard />;

  return (
    <div className="rounded-2xl border border-border bg-card p-8">
      <h1 className="text-xl font-bold text-foreground">Choose a role to continue</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Your account has no role yet. Sign out and sign in again picking Student, University or Employer.
      </p>
    </div>
  );
}
