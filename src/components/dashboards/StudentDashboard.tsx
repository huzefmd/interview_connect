import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Briefcase, CalendarClock, CheckCircle2, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { StatCard, PageHeader } from "./StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function StudentDashboard({ userId }: { userId: string }) {
  const { data } = useQuery({
    queryKey: ["student-dashboard", userId],
    queryFn: async () => {
      const [profile, apps, interviews] = await Promise.all([
        supabase.from("student_profiles").select("*").eq("user_id", userId).maybeSingle(),
        supabase
          .from("applications")
          .select("*, jobs(title, location, employer_id)")
          .eq("student_id", userId)
          .order("created_at", { ascending: false }),
        supabase
          .from("interviews")
          .select("*, jobs(title)")
          .eq("student_id", userId)
          .order("scheduled_at", { ascending: true }),
      ]);
      return {
        profile: profile.data,
        applications: apps.data ?? [],
        interviews: interviews.data ?? [],
      };
    },
  });

  const applications = data?.applications ?? [];
  const interviews = data?.interviews ?? [];
  const upcoming = interviews.filter((i) => i.status === "scheduled" || i.status === "in_progress");
  const shortlisted = applications.filter((a) => a.status === "shortlisted" || a.status === "selected").length;
  const profile = data?.profile;
  const completeness = profile
    ? Math.round(
        ([profile.headline, profile.location, profile.resume_url, profile.skills.length > 0].filter(Boolean).length /
          4) *
          100,
      )
    : 0;

  return (
    <div>
      <PageHeader title="Student dashboard" subtitle="Your applications, interviews and profile at a glance." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={FileText} label="Profile complete" value={`${completeness}%`} />
        <StatCard icon={Briefcase} label="Applications" value={applications.length} />
        <StatCard icon={CheckCircle2} label="Shortlisted" value={shortlisted} />
        <StatCard icon={CalendarClock} label="Upcoming interviews" value={upcoming.length} />
      </div>

      {completeness < 100 && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-primary/30 bg-primary/5 p-5">
          <div>
            <p className="font-semibold text-foreground">Finish your profile</p>
            <p className="text-sm text-muted-foreground">
              Employers shortlist complete profiles with a resume far more often.
            </p>
          </div>
          <Button asChild size="sm">
            <Link to="/profile">Complete profile</Link>
          </Button>
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-foreground">Applied jobs</h2>
            <Button asChild variant="ghost" size="sm">
              <Link to="/jobs">Browse jobs</Link>
            </Button>
          </div>
          <ul className="mt-4 space-y-3">
            {applications.length === 0 && <p className="text-sm text-muted-foreground">No applications yet.</p>}
            {applications.slice(0, 6).map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 rounded-xl border border-border p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{a.jobs?.title ?? "Job"}</p>
                  <p className="truncate text-xs text-muted-foreground">{a.jobs?.location ?? "Remote"}</p>
                </div>
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
