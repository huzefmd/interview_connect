import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Users, BadgeCheck, Briefcase, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { notify } from "@/hooks/useAuth";
import { StatCard, PageHeader } from "./StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export function CollegeDashboard({ userId }: { userId: string }) {
  const queryClient = useQueryClient();
  const [q, setQ] = useState("");

  const { data } = useQuery({
    queryKey: ["university-dashboard", userId],
    queryFn: async () => {
      const { data: students } = await supabase
        .from("student_profiles")
        .select("*")
        .eq("university_id", userId);
      const ids = (students ?? []).map((s) => s.user_id);
      const { data: people } = ids.length
        ? await supabase.from("profiles").select("id, full_name, email").in("id", ids)
        : { data: [] };
      const nameById = new Map((people ?? []).map((p) => [p.id, p]));
      const [apps, interviews] = await Promise.all([
        ids.length
          ? supabase.from("applications").select("id, status, student_id, jobs(title, employer_id)").in("student_id", ids)
          : Promise.resolve({ data: [] as never[] }),
        ids.length
          ? supabase.from("interviews").select("id, status, student_id, employer_id").in("student_id", ids)
          : Promise.resolve({ data: [] as never[] }),
      ]);
      const employerIds = Array.from(new Set((interviews.data ?? []).map((i) => i.employer_id)));
      const { data: employers } = employerIds.length
        ? await supabase.from("employer_profiles").select("user_id, company_name, industry").in("user_id", employerIds)
        : { data: [] };
      return {
        students: (students ?? []).map((s) => ({ ...s, person: nameById.get(s.user_id) ?? null })),
        applications: apps.data ?? [],
        interviews: interviews.data ?? [],
        employers: employers ?? [],
      };
    },
  });

  const students = data?.students ?? [];
  const applications = data?.applications ?? [];
  const placed = new Set(applications.filter((a) => a.status === "selected").map((a) => a.student_id)).size;
  const filtered = students.filter((s) =>
    (s.person?.full_name ?? "").toLowerCase().includes(q.toLowerCase()),
  );

  async function toggleVerify(studentId: string, verified: boolean) {
    const { error } = await supabase.from("student_profiles").update({ verified }).eq("user_id", studentId);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (verified) await notify(studentId, "Profile verified", "Your university verified your profile.");
    toast.success(verified ? "Student verified" : "Verification removed");
    queryClient.invalidateQueries({ queryKey: ["university-dashboard", userId] });
  }

  return (
    <div>
      <PageHeader title="College dashboard" subtitle="Manage students, verify profiles and track placements." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Students" value={students.length} />
        <StatCard icon={BadgeCheck} label="Verified" value={students.filter((s) => s.verified).length} />
        <StatCard icon={Briefcase} label="Applications" value={applications.length} />
        <StatCard
          icon={TrendingUp}
          label="Placement rate"
          value={students.length ? `${Math.round((placed / students.length) * 100)}%` : "0%"}
        />
      </div>

      <section className="mt-8 rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-bold text-foreground">Students</h2>
          <Input
            placeholder="Search students"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full max-w-xs"
          />
        </div>
        <div className="mt-4 space-y-3">
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No students linked yet. Students link to you by selecting your institution in their profile.
            </p>
          )}
          {filtered.map((s) => (
            <div
              key={s.user_id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-4"
            >
              <div className="min-w-0">
                <p className="font-semibold text-foreground">{s.person?.full_name ?? "Student"}</p>
                <p className="text-xs text-muted-foreground">{s.headline ?? s.person?.email ?? "—"}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {s.skills.slice(0, 5).map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {s.verified ? <Badge className="bg-accent text-accent-foreground">Verified</Badge> : null}
                <Button size="sm" variant={s.verified ? "outline" : "default"} onClick={() => toggleVerify(s.user_id, !s.verified)}>
                  {s.verified ? "Unverify" : "Verify"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-border bg-card p-6">
        <h2 className="font-bold text-foreground">Partnered employers</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(data?.employers ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground">No employers have interviewed your students yet.</p>
          )}
          {(data?.employers ?? []).map((e) => (
            <div key={e.user_id} className="rounded-xl border border-border p-4">
              <p className="font-semibold text-foreground">{e.company_name}</p>
              <p className="text-xs text-muted-foreground">{e.industry ?? "—"}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
