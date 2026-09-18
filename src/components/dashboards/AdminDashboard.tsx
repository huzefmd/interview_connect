import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/hooks/useAuth";
import { PageHeader } from "@/components/dashboards/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle, ShieldCheck, Users, Briefcase, FileText, Building2 } from "lucide-react";

export function AdminDashboard() {
  const { user } = useUser();
  const queryClient = useQueryClient();

  // ============================================================
  // GENERAL STATS
  // ============================================================
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-stats"],
    staleTime: 1000 * 60 * 5,
    queryFn: async () => {
      const [usersRes, jobsRes, appsRes] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("jobs").select("*", { count: "exact", head: true }),
        supabase.from("applications").select("*", { count: "exact", head: true }),
      ]);
      return {
        userCount: usersRes.count ?? 0,
        jobCount: jobsRes.count ?? 0,
        appCount: appsRes.count ?? 0,
      };
    },
  });

  // ============================================================
  // DETAILED METRICS
  // ============================================================
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["admin-detailed-metrics"],
    staleTime: 1000 * 60 * 5,

    queryFn: async () => {
      // 1. UNIVERSITY DATA
      const { data: univs } = await supabase
        .from("university_profiles")
        .select("user_id, name");

      // ... (keep students and placements)
      const { data: students } = await supabase
        .from("student_profiles")
        .select("user_id, university_id");

      const { data: placements } = await supabase
        .from("applications")
        .select("student_id")
        .eq("status", "selected");

      const selectedStudentIds = new Set(
        (placements ?? []).map((placement) => placement.student_id)
      );

      const universityMetrics = (univs ?? []).map((university) => {
        // Try matching university_id against both primary ID and user_id
        const universityStudents = (students ?? []).filter(
          (student) =>
            student.university_id === university.user_id ||
            student.university_id === university.id
        );

        const placedStudents = universityStudents.filter((student) =>
          selectedStudentIds.has(student.user_id)
        );

        const placementRate =
          universityStudents.length > 0
            ? Math.round(
                (placedStudents.length /
                  universityStudents.length) *
                100
              )
            : 0;

        return {
          name: university.name,
          studentCount: universityStudents.length,
          placedCount: placedStudents.length,
          placementRate,
        };
      });

      // 4. EMPLOYER DATA
      const { data: employers } = await supabase
        .from("employer_profiles")
        .select("user_id, company_name");

      const { data: allJobs } = await supabase
        .from("jobs")
        .select("employer_id");

      const { data: allApps } = await supabase
        .from("applications")
        .select("student_id, jobs(employer_id)")
        .eq("status", "selected");

      const employerMetrics = (employers ?? []).map((employer) => {
        const jobCount = (allJobs ?? []).filter(
          (job) =>
            job.employer_id === employer.user_id
        ).length;

        const selectedCount = (allApps ?? []).filter(
          (application) =>
            application.jobs?.employer_id === employer.user_id
        ).length;

        return {
          name: employer.company_name,
          jobCount,
          selectedCount,
        };
      });

      return {
        universityMetrics,
        employerMetrics,
      };
    },
  });

  return (
    <div className="space-y-10">
      <div className="space-y-6">
        <PageHeader title="Admin Control Center" subtitle="Complete system monitoring, verification and user management." />

        <div className="grid gap-4 sm:grid-cols-3 mt-6">
          <div className="rounded-2xl border border-border bg-card p-6 flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/10 text-primary"><Users className="h-6 w-6" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold">{stats?.userCount}</p>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/10 text-primary"><Briefcase className="h-6 w-6" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Active Jobs</p>
              <p className="text-2xl font-bold">{stats?.jobCount}</p>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/10 text-primary"><FileText className="h-6 w-6" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Total Applications</p>
              <p className="text-2xl font-bold">{stats?.appCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-10">
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Building2 className="h-6 w-6 text-primary" />
            <h3 className="text-xl font-bold">College Network</h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(metrics?.universityMetrics ?? []).map((u, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
                <h4 className="font-bold text-lg mb-4 truncate">{u.name}</h4>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{u.studentCount} Students</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <Badge variant="secondary" className="font-bold">
                      {u.placementRate}% Placed
                    </Badge>
                    <span className="text-[10px] text-muted-foreground mt-1">
                      {u.placedCount}/{u.studentCount} students
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {metrics?.universityMetrics.length === 0 && <p className="text-sm text-muted-foreground">No universities found.</p>}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-6">
            <Briefcase className="h-6 w-6 text-primary" />
            <h3 className="text-xl font-bold">Employer Partners</h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(metrics?.employerMetrics ?? []).map((e, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
                <h4 className="font-bold text-lg mb-4 truncate">{e.name}</h4>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{e.jobCount} Jobs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{e.selectedCount} Selected</span>
                  </div>
                </div>
              </div>
            ))}
            {metrics?.employerMetrics.length === 0 && <p className="text-sm text-muted-foreground">No employers found.</p>}
          </div>
        </section>
      </div>

      <Tabs defaultValue="verification" className="space-y-6">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <h3 className="text-xl font-bold">Administrative Tools</h3>
        </div>
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="verification">Verification</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="metrics">Detailed Metrics</TabsTrigger>
        </TabsList>
        <TabsContent value="verification">
          <EmployerVerification userId={user?.id} />
        </TabsContent>
        <TabsContent value="users">
          <UserManagement userId={user?.id} />
        </TabsContent>
        <TabsContent value="metrics">
          <SystemMetricsTable metrics={metrics} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SystemMetricsTable({ metrics }: { metrics: any }) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="text-lg font-bold mb-4">College Performance</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>College</TableHead>
              <TableHead>Students</TableHead>
              <TableHead>Placed</TableHead>
              <TableHead>Placement Rate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(metrics?.universityMetrics ?? []).map((u, i) => (
              <TableRow key={i}>
                <TableCell className="font-medium">{u.name}</TableCell>
                <TableCell>{u.studentCount}</TableCell>
                <TableCell>{u.placedCount}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{u.placementRate}%</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="text-lg font-bold mb-4">Employer Activity</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Jobs Posted</TableHead>
              <TableHead>Students Selected</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(metrics?.employerMetrics ?? []).map((e, i) => (
              <TableRow key={i}>
                <TableCell className="font-medium">{e.name}</TableCell>
                <TableCell>{e.jobCount}</TableCell>
                <TableCell>{e.selectedCount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

async function getDocUrl(path: string) {
  const { data, error } = await supabase.storage
    .from("employer-docs")
    .createSignedUrl(path, 60); // URL valid for 60 seconds

  if (error) {
    console.error("Error generating signed URL:", error);
    return null;
  }
  return data.signedUrl;
}

function EmployerVerification({ userId }: { userId: string | undefined }) {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["unverified-employers"],
    queryFn: async () => {
      const { data } = await supabase
        .from("employer_profiles")
        .select("user_id, company_name, id_proof_url")
        .eq("verified", false);
      return data ?? [];
    },
  });

  async function verify(employerId: string) {
    try {
      const { error } = await supabase.from("employer_profiles").update({ verified: true }).eq("user_id", employerId);
      if (error) throw error;

      toast.success("Employer verified successfully");
      await queryClient.invalidateQueries({ queryKey: ["unverified-employers"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to verify employer");
      console.error("Verification error:", err);
    }
  }

  if (isLoading) return <Skeleton className="h-64 w-full" />;

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-primary" /> Pending Employer Verifications
      </h3>
      {data.length === 0 ? (
        <p className="text-sm text-muted-foreground">No employers awaiting verification.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Proof</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((emp) => (
              <TableRow key={emp.user_id}>
                <TableCell className="font-medium">{emp.company_name}</TableCell>
                <TableCell>
                  {emp.id_proof_url ? (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          const url = await getDocUrl(emp.id_proof_url!);
                          if (url) window.open(url, "_blank");
                          else toast.error("Could not generate document link");
                        }}
                        className="gap-2"
                      >
                        <FileText className="h-4 w-4" /> View Document
                      </Button>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">No document uploaded</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" onClick={() => verify(emp.user_id)} className="gap-2">
                    <CheckCircle className="h-4 w-4" /> Verify
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

function UserManagement({ userId }: { userId: string | undefined }) {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["all-users"],
    queryFn: async () => {
      const { data: profiles } = await supabase.from("profiles").select("id, full_name, email");
      const { data: roles } = await supabase.from("user_roles").select("user_id, role");
      const { data: employers } = await supabase.from("employer_profiles").select("user_id, id_proof_url");

      const roleMap = new Map(roles?.map(r => [r.user_id, r.role]) ?? []);
      const docMap = new Map(employers?.map(e => [e.user_id, e.id_proof_url]) ?? []);

      return (profiles ?? []).map(p => ({
        ...p,
        role: roleMap.get(p.id) ?? "unknown",
        idProofUrl: docMap.get(p.id)
      }));
    },
  });

  async function updateRole(userId: string, newRole: string) {
    const { error } = await supabase
      .from("user_roles")
      .upsert({ user_id: userId, role: newRole });

    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Role updated");
    queryClient.invalidateQueries();
  }

  if (isLoading) return <Skeleton className="h-64 w-full" />;

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">User Directory</h3>
        <Input placeholder="Search users..." className="max-w-xs" />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.map((u) => (
            <TableRow key={u.id}>
              <TableCell className="font-medium">{u.full_name}</TableCell>
              <TableCell>{u.email}</TableCell>
              <TableCell>
                <Badge variant={u.role === "admin" ? "default" : "secondary"}>
                  {u.role}
                </Badge>
                {u.role === "employer" && u.idProofUrl && (
                  <div className="mt-2">
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={async () => {
                        const url = await getDocUrl(u.idProofUrl!);
                        if (url) window.open(url, "_blank");
                        else toast.error("Could not generate document link");
                      }}
                      className="h-6 px-2 text-[10px] gap-1"
                    >
                      <FileText className="h-3 w-3" /> View Doc
                    </Button>
                  </div>
                )}
              </TableCell>
              <TableCell className="text-right">
                <Select value={u.role} onValueChange={(val) => updateRole(u.id, val)}>
                  <SelectTrigger className="w-32 ml-auto">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="university">College</SelectItem>
                    <SelectItem value="employer">Employer</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
