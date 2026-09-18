import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { GraduationCap, Building2, Briefcase, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Logo } from "@/components/jobsync/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { AppRole } from "@/hooks/useAuth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in or create your JobSync account" },
      {
        name: "description",
        content:
          "Log in to JobSync as a student, university or employer to manage campus placements, jobs and interviews.",
      },
      { property: "og:title", content: "Sign in to JobSync" },
      {
        property: "og:description",
        content: "Students, universities and employers sign in here to access their JobSync dashboard.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

const roles: { value: AppRole; label: string; icon: typeof GraduationCap; blurb: string }[] = [
  { value: "student", label: "Student", icon: GraduationCap, blurb: "Find jobs & interview" },
  { value: "university", label: "College", icon: Building2, blurb: "Run placements" },
  { value: "employer", label: "Employer", icon: Briefcase, blurb: "Hire campus talent" },
  { value: "admin", label: "Admin", icon: ShieldCheck, blurb: "Manage system" },
];

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [role, setRole] = useState<AppRole>("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session) {
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", data.session.user.id)
          .maybeSingle();
        const role = roleData?.role || "student";
        navigate({ to: role === "admin" ? "/admin/dashboard" : "/dashboard", replace: true });
      }
    });
  }, [navigate]);

  async function ensureRole(userId: string, wanted: AppRole) {
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId).maybeSingle();
    if (!data) await supabase.from("user_roles").insert({ user_id: userId, role: wanted });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { full_name: name, role },
          },
        });
        if (error) throw error;
        if (!data.session) {
          setSent(true);
          toast.success("Check your email to confirm your account.");
          return;
        }
        await ensureRole(data.user!.id, role);
        navigate({ to: role === "admin" ? "/admin/dashboard" : "/dashboard" });
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        // Fetch the actual role from the database instead of relying on the UI selection
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", data.user.id)
          .maybeSingle();

        const actualRole = roleData?.role || "student";
        navigate({ to: actualRole === "admin" ? "/admin/dashboard" : "/dashboard" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setBusy(true);
    try {
      window.localStorage.setItem("khoranex_pending_role", role);
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error("Google sign-in failed. Please try again.");
        return;
      }
      if (result.redirected) return;

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .maybeSingle();
        const actualRole = roleData?.role || "student";
        navigate({ to: actualRole === "admin" ? "/admin/dashboard" : "/dashboard" });
      } else {
        navigate({ to: "/dashboard" });
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleReset() {
    if (!email) {
      toast.error("Enter your email first");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) toast.error(error.message);
    else toast.success("Password reset link sent.");
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="relative hidden flex-col justify-between bg-gradient-brand p-12 text-primary-foreground lg:flex">
        <Link to="/" className="w-fit">
          <Logo variant="light" />
        </Link>
        <div>
          <h1 className="max-w-md text-4xl font-bold leading-tight">Where talent meets opportunity.</h1>
          <p className="mt-4 max-w-md text-primary-foreground/80">
            One platform for students, universities and employers — profiles, job postings, applications and live
            in-app interviews.
          </p>
        </div>
        <p className="text-sm text-primary-foreground/70">© 2025-26 JobSync</p>
      </section>

      <section className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden">
            <Link to="/">
              <Logo />
            </Link>
          </div>

          <Tabs value={mode} onValueChange={(v) => setMode(v as "login" | "signup")} className="mt-8">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Log in</TabsTrigger>
              <TabsTrigger value="signup">Sign up</TabsTrigger>
            </TabsList>

            <TabsContent value={mode} className="mt-8">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                {mode === "login" ? "Welcome back" : "Create your account"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">Choose your role to continue.</p>

              <div className="mt-5 grid grid-cols-3 gap-2">
                {roles.map((r) => {
                  const Icon = r.icon;
                  const active = role === r.value;
                  return (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setRole(r.value)}
                      className={`rounded-xl border p-3 text-left transition-colors ${
                        active ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${active ? "text-primary" : "text-muted-foreground"}`} />
                      <span className="mt-2 block text-sm font-semibold text-foreground">{r.label}</span>
                      <span className="block text-[11px] text-muted-foreground">{r.blurb}</span>
                    </button>
                  );
                })}
              </div>

              {sent ? (
                <div className="mt-6 rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
                  We sent a confirmation link to <strong className="text-foreground">{email}</strong>. Confirm it, then
                  log in.
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  {mode === "signup" && (
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        {role === "student" ? "Full name" : role === "admin" ? "Name" : "Organization name"}
                      </Label>
                      <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={120} />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      maxLength={255}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={busy}>
                    {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {mode === "login" ? "Log in" : "Create account"}
                  </Button>
                </form>
              )}

              <div className="my-6 flex items-center gap-4">
                <span className="h-px flex-1 bg-border" />
                <span className="text-xs uppercase tracking-wider text-muted-foreground">or</span>
                <span className="h-px flex-1 bg-border" />
              </div>

              <Button variant="outline" className="w-full" onClick={handleGoogle} disabled={busy}>
                Continue with Google
              </Button>

              {mode === "login" && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-primary"
                >
                  Forgot your password?
                </button>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </main>
  );
}
