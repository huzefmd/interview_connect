import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useUser, useMyRole, notify } from "@/hooks/useAuth";
import { PageHeader } from "@/components/dashboards/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/jobs")({
  head: () => ({
    meta: [
      { title: "Campus jobs on Khoranex" },
      { name: "description", content: "Browse and apply to campus roles, or post and manage openings." },
      { property: "og:title", content: "Campus jobs on Khoranex" },
      { property: "og:description", content: "Browse and apply to campus roles, or post and manage openings." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: JobsPage,
});

function JobsPage() {
  const { user } = useUser();
  const { data: role } = useMyRole(user?.id);
  if (!user || !role) return <Skeleton className="h-96 w-full" />;
  return role === "employer" ? <EmployerJobs userId={user.id} /> : <StudentJobs userId={user.id} />;
}

function StudentJobs({ userId }: { userId: string }) {
  const queryClient = useQueryClient();
  const [q, setQ] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["open-jobs", userId],
    queryFn: async () => {
      const [jobs, apps] = await Promise.all([
        supabase.from("jobs").select("*").eq("is_open", true).order("created_at", { ascending: false }),
        supabase.from("applications").select("job_id, status").eq("student_id", userId),
      ]);
      const employerIds = Array.from(new Set((jobs.data ?? []).map((j) => j.employer_id)));
      const { data: employers } = employerIds.length
        ? await supabase.from("employer_profiles").select("user_id, company_name").in("user_id", employerIds)
        : { data: [] };
      const companyById = new Map((employers ?? []).map((e) => [e.user_id, e.company_name]));
      return {
        jobs: (jobs.data ?? []).map((j) => ({ ...j, company: companyById.get(j.employer_id) ?? "Employer" })),
        applied: new Map((apps.data ?? []).map((a) => [a.job_id, a.status])),
      };
    },
  });

  async function apply(jobId: string, employerId: string, title: string) {
    const { error } = await supabase.from("applications").insert({ job_id: jobId, student_id: userId });
    if (error) {
      toast.error(error.message);
      return;
    }
    await notify(employerId, "New application", `A student applied to ${title}.`);
    toast.success("Application submitted");
    queryClient.invalidateQueries();
  }

  if (isLoading) return <Skeleton className="h-96 w-full" />;
  const jobs = (data?.jobs ?? []).filter(
    (j) => j.title.toLowerCase().includes(q.toLowerCase()) || j.company.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div>
      <PageHeader title="Jobs" subtitle="Roles open to campus talent right now." />
      <Input placeholder="Search roles or companies" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-sm" />
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {jobs.length === 0 && <p className="text-sm text-muted-foreground">No open roles yet.</p>}
        {jobs.map((j) => {
          const status = data?.applied.get(j.id);
          return (
            <article key={j.id} className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-bold text-foreground">{j.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    {j.company} · {j.location ?? "Remote"} · {j.job_type}
                  </p>
                </div>
                {j.ctc && <Badge variant="secondary">{j.ctc}</Badge>}
              </div>
              {j.description && <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{j.description}</p>}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {j.skills.map((s) => (
                  <Badge key={s} variant="outline">
                    {s}
                  </Badge>
                ))}
              </div>
              <div className="mt-5">
                {status ? (
                  <Badge className="capitalize">{status.replace("_", " ")}</Badge>
                ) : (
                  <Button size="sm" onClick={() => apply(j.id, j.employer_id, j.title)}>
                    Apply now
                  </Button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function EmployerJobs({ userId }: { userId: string }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ title: "", location: "", job_type: "Full-time", ctc: "", skills: "", description: "" });
  const [open, setOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["my-jobs", userId],
    queryFn: async () => {
      const { data: jobs } = await supabase.from("jobs").select("*").eq("employer_id", userId).order("created_at", { ascending: false });
      const ids = (jobs ?? []).map((j) => j.id);
      const { data: apps } = ids.length
        ? await supabase.from("applications").select("*").in("job_id", ids)
        : { data: [] };
      const studentIds = Array.from(new Set((apps ?? []).map((a) => a.student_id)));
      const { data: people } = studentIds.length
        ? await supabase.from("profiles").select("id, full_name, email").in("id", studentIds)
        : { data: [] };
      const nameById = new Map((people ?? []).map((p) => [p.id, p.full_name]));
      return {
        jobs: jobs ?? [],
        apps: (apps ?? []).map((a) => ({ ...a, name: nameById.get(a.student_id) ?? "Student" })),
      };
    },
  });

  async function createJob(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from("jobs").insert({
      employer_id: userId,
      title: form.title,
      location: form.location || null,
      job_type: form.job_type,
      ctc: form.ctc || null,
      description: form.description || null,
      skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Job posted");
    setOpen(false);
    setForm({ title: "", location: "", job_type: "Full-time", ctc: "", skills: "", description: "" });
    queryClient.invalidateQueries();
  }

  async function setStatus(appId: string, studentId: string, status: "shortlisted" | "selected" | "rejected") {
    const { error } = await supabase.from("applications").update({ status }).eq("id", appId);
    if (error) {
      toast.error(error.message);
      return;
    }
    await notify(studentId, `Application ${status}`, `Your application status changed to ${status}.`);
    queryClient.invalidateQueries();
  }

  async function schedule(studentId: string, jobId: string, appId: string, whenLocal: string) {
    if (!whenLocal) {
      toast.error("Pick a date and time");
      return;
    }
    const { error } = await supabase.from("interviews").insert({
      employer_id: userId,
      student_id: studentId,
      job_id: jobId,
      application_id: appId,
      scheduled_at: new Date(whenLocal).toISOString(),
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    await notify(studentId, "Interview scheduled", `Your interview is on ${new Date(whenLocal).toLocaleString()}.`);
    toast.success("Interview scheduled");
    queryClient.invalidateQueries();
  }

  async function toggleOpen(id: string, is_open: boolean) {
    await supabase.from("jobs").update({ is_open }).eq("id", id);
    queryClient.invalidateQueries();
  }

  if (isLoading) return <Skeleton className="h-96 w-full" />;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader title="My job posts" subtitle="Post roles and move applicants through your pipeline." />
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Post a job</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New job post</DialogTitle>
            </DialogHeader>
            <form onSubmit={createJob} className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required maxLength={140} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Input value={form.job_type} onChange={(e) => setForm({ ...form, job_type: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>CTC / stipend</Label>
                  <Input value={form.ctc} onChange={(e) => setForm({ ...form, ctc: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Skills (comma separated)</Label>
                  <Input value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} maxLength={4000} />
              </div>
              <Button type="submit" className="w-full">
                Publish job
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-6">
        {(data?.jobs ?? []).length === 0 && <p className="text-sm text-muted-foreground">No jobs posted yet.</p>}
        {(data?.jobs ?? []).map((j) => {
          const apps = (data?.apps ?? []).filter((a) => a.job_id === j.id);
          return (
            <section key={j.id} className="rounded-2xl border border-border bg-card p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-bold text-foreground">{j.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    {j.location ?? "Remote"} · {apps.length} applicant{apps.length === 1 ? "" : "s"}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => toggleOpen(j.id, !j.is_open)}>
                  {j.is_open ? "Close role" : "Reopen role"}
                </Button>
              </div>

              <div className="mt-4 space-y-3">
                {apps.map((a) => (
                  <ApplicantRow
                    key={a.id}
                    name={a.name}
                    status={a.status}
                    onStatus={(s) => setStatus(a.id, a.student_id, s)}
                    onSchedule={(when) => schedule(a.student_id, j.id, a.id, when)}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function ApplicantRow({
  name,
  status,
  onStatus,
  onSchedule,
}: {
  name: string;
  status: string;
  onStatus: (s: "shortlisted" | "selected" | "rejected") => void;
  onSchedule: (when: string) => void;
}) {
  const [when, setWhen] = useState("");
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border p-3">
      <p className="font-medium text-foreground">{name}</p>
      <Badge variant="secondary" className="capitalize">
        {status.replace("_", " ")}
      </Badge>
      <div className="ml-auto flex flex-wrap items-center gap-2">
        <Button size="sm" variant="outline" onClick={() => onStatus("shortlisted")}>
          Shortlist
        </Button>
        <Button size="sm" variant="outline" onClick={() => onStatus("selected")}>
          Select
        </Button>
        <Button size="sm" variant="ghost" onClick={() => onStatus("rejected")}>
          Reject
        </Button>
        <Input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} className="w-52" />
        <Button size="sm" onClick={() => onSchedule(when)}>
          Schedule interview
        </Button>
      </div>
    </div>
  );
}
