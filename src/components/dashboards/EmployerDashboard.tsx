import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Briefcase, Users, Star, CalendarClock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { StatCard, PageHeader } from "./StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function EmployerDashboard({ userId }: { userId: string }) {
  const { data } = useQuery({
    queryKey: ["employer-dashboard", userId],
    queryFn: async () => {
      const { data: jobs } = await supabase.from("jobs").select("*").eq("employer_id", userId);
      const jobIds = (jobs ?? []).map((j) => j.id);
      const [apps, interviews] = await Promise.all([
        jobIds.length
          ? supabase.from("applications").select("*, jobs(title)").in("job_id", jobIds).order("created_at", { ascending: false })
          : Promise.resolve({ data: [] as never[] }),
        supabase.from("interviews").select("*, jobs(title)").eq("employer_id", userId).order("scheduled_at"),
      ]);
      return { jobs: jobs ?? [], applications: apps.data ?? [], interviews: interviews.data ?? [] };
    },
  });

  const jobs = data?.jobs ?? [];
  const applications = data?.applications ?? [];
  const interviews = data?.interviews ?? [];
  const upcoming = interviews.filter((i) => i.status === "scheduled" || i.status === "in_progress");

  return (
    <div>
      <PageHeader title="Employer dashboard" subtitle="Post roles, review applicants and run interviews." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Briefcase} label="Open roles" value={jobs.filter((j) => j.is_open).length} />
        <StatCard icon={Users} label="Applicants" value={applications.length} />
        <StatCard icon={Star} label="Shortlisted" value={applications.filter((a) => a.status === "shortlisted").length} />
        <StatCard icon={CalendarClock} label="Upcoming interviews" value={upcoming.length} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-foreground">Recent applicants</h2>
            <Button asChild variant="ghost" size="sm">
              <Link to="/jobs">Manage jobs</Link>
            </Button>
          </div>
          <ul className="mt-4 space-y-3">
            {applications.length === 0 && <p className="text-sm text-muted-foreground">No applicants yet.</p>}
            {applications.slice(0, 6).map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 rounded-xl border border-border p-3">
                <p className="truncate text-sm font-semibold text-foreground">{a.jobs?.title ?? "Job"}</p>
                <Badge variant="secondary" className="capitalize">
                  {a.status.replace("_", " ")}
                </Badge>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-foreground">Upcoming interviews</h2>
            <Button asChild variant="ghost" size="sm">
              <Link to="/interviews">All interviews</Link>
            </Button>
          </div>
          <ul className="mt-4 space-y-3">
            {upcoming.length === 0 && <p className="text-sm text-muted-foreground">Nothing scheduled.</p>}
            {upcoming.slice(0, 6).map((i) => (
              <li key={i.id} className="flex items-center justify-between gap-3 rounded-xl border border-border p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{i.jobs?.title ?? "Interview"}</p>
                  <p className="text-xs text-muted-foreground">{new Date(i.scheduled_at).toLocaleString()}</p>
                </div>
                <Button asChild size="sm">
                  <Link to="/interview/$id" params={{ id: i.id }}>
                    Join
                  </Link>
                </Button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
