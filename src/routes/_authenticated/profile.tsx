import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Upload, FileText } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useUser, useMyRole } from "@/hooks/useAuth";
import { PageHeader } from "@/components/dashboards/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Your Khoranex profile" },
      { name: "description", content: "Keep your Khoranex profile up to date so you get matched faster." },
      { property: "og:title", content: "Your Khoranex profile" },
      { property: "og:description", content: "Keep your Khoranex profile up to date so you get matched faster." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfilePage,
});

function csvToArray(v: string) {
  return v.split(",").map((s) => s.trim()).filter(Boolean);
}

function ProfilePage() {
  const { user } = useUser();
  const { data: role } = useMyRole(user?.id);
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["profile-page", user?.id, role],
    enabled: !!user?.id && !!role,
    queryFn: async () => {
      const base = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      const table =
        role === "student" ? "student_profiles" : role === "university" ? "university_profiles" : "employer_profiles";
      const detail = await supabase.from(table).select("*").eq("user_id", user!.id).maybeSingle();
      const universities =
        role === "student" ? (await supabase.from("university_profiles").select("user_id, name")).data ?? [] : [];
      return { base: base.data, detail: detail.data as Record<string, unknown> | null, table, universities };
    },
  });

  useEffect(() => {
    if (!data) return;
    const d = (data.detail ?? {}) as Record<string, unknown>;
    const str = (v: unknown) => (Array.isArray(v) ? v.join(", ") : v == null ? "" : String(v));
    setForm({
      full_name: data.base?.full_name ?? "",
      phone: data.base?.phone ?? "",
      headline: str(d["headline"]),
      location: str(d["location"]),
      date_of_birth: str(d["date_of_birth"]),
      skills: str(d["skills"]),
      interests: str(d["interests"]),
      certifications: str(d["certifications"]),
      university_id: str(d["university_id"]),
      resume_url: str(d["resume_url"]),
      name: str(d["name"]),
      accreditation: str(d["accreditation"]),
      contact_person: str(d["contact_person"]),
      contact_phone: str(d["contact_phone"]),
      address: str(d["address"]),
      website: str(d["website"]),
      programs: str(d["programs"]),
      company_name: str(d["company_name"]),
      industry: str(d["industry"]),
      company_size: str(d["company_size"]),
      description: str(d["description"]),
      hr_name: str(d["hr_name"]),
      hr_email: str(d["hr_email"]),
      hr_phone: str(d["hr_phone"]),
      logo_url: str(d["logo_url"]),
    });
    const path = data.base?.avatar_url;
    if (path) {
      supabase.storage.from("avatars").createSignedUrl(path, 3600).then(({ data: s }) => setAvatarUrl(s?.signedUrl ?? null));
    }
  }, [data]);

  const set = (k: string) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function uploadFile(bucket: "avatars" | "resumes", file: File) {
    const ext = file.name.split(".").pop();
    const path = `${user!.id}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
    if (error) throw error;
    return path;
  }

  async function onAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    try {
      const path = await uploadFile("avatars", file);
      await supabase.from("profiles").update({ avatar_url: path }).eq("id", user.id);
      const { data: s } = await supabase.storage.from("avatars").createSignedUrl(path, 3600);
      setAvatarUrl(s?.signedUrl ?? null);
      toast.success("Photo updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    }
  }

  async function onResume(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.type !== "application/pdf") {
      toast.error("Resume must be a PDF");
      return;
    }
    try {
      const path = await uploadFile("resumes", file);
      setForm((f) => ({ ...f, resume_url: path }));
      await supabase.from("student_profiles").upsert({ user_id: user.id, resume_url: path });
      toast.success("Resume uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !data) return;
    setSaving(true);
    try {
      await supabase.from("profiles").update({ full_name: form["full_name"] ?? "", phone: form["phone"] || null }).eq("id", user.id);

      let payload: Record<string, unknown> = { user_id: user.id };
      if (role === "student") {
        payload = {
          ...payload,
          headline: form["headline"] || null,
          location: form["location"] || null,
          date_of_birth: form["date_of_birth"] || null,
          skills: csvToArray(form["skills"] ?? ""),
          interests: csvToArray(form["interests"] ?? ""),
          certifications: csvToArray(form["certifications"] ?? ""),
          university_id: form["university_id"] || null,
          resume_url: form["resume_url"] || null,
        };
      } else if (role === "university") {
        payload = {
          ...payload,
          name: form["name"] || form["full_name"] || "",
          accreditation: form["accreditation"] || null,
          contact_person: form["contact_person"] || null,
          contact_phone: form["contact_phone"] || null,
          address: form["address"] || null,
          website: form["website"] || null,
          programs: csvToArray(form["programs"] ?? ""),
        };
      } else {
        payload = {
          ...payload,
          company_name: form["company_name"] || form["full_name"] || "",
          industry: form["industry"] || null,
          company_size: form["company_size"] || null,
          location: form["location"] || null,
          description: form["description"] || null,
          website: form["website"] || null,
          hr_name: form["hr_name"] || null,
          hr_email: form["hr_email"] || null,
          hr_phone: form["hr_phone"] || null,
        };
      }

      const { error } = await supabase.from(data.table as "student_profiles").upsert(payload as never, { onConflict: "user_id" });
      if (error) throw error;
      toast.success("Profile saved");
      queryClient.invalidateQueries();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  if (isLoading || !role) return <Skeleton className="h-96 w-full" />;

  return (
    <div className="max-w-3xl">
      <PageHeader title="Profile" subtitle="This is what universities and employers see." />

      <form onSubmit={save} className="space-y-6 rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-muted">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Profile photo" className="h-full w-full object-cover" />
            ) : (
              <Upload className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <div>
            <Label htmlFor="avatar" className="cursor-pointer text-sm font-semibold text-primary">
              {role === "student" ? "Upload photo" : "Upload logo"}
            </Label>
            <Input id="avatar" type="file" accept="image/*" className="mt-2" onChange={onAvatar} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={role === "student" ? "Full name" : "Contact name"} value={form["full_name"] ?? ""} onChange={set("full_name")} />
          <Field label="Phone" value={form["phone"] ?? ""} onChange={set("phone")} />
        </div>

        {role === "student" && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Headline" value={form["headline"] ?? ""} onChange={set("headline")} />
              <Field label="Location" value={form["location"] ?? ""} onChange={set("location")} />
              <Field label="Date of birth" type="date" value={form["date_of_birth"] ?? ""} onChange={set("date_of_birth")} />
              <div className="space-y-2">
                <Label>University</Label>
                <Select
                  value={form["university_id"] ?? ""}
                  onValueChange={(v) => setForm((f) => ({ ...f, university_id: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your institution" />
                  </SelectTrigger>
                  <SelectContent>
                    {(data?.universities ?? []).map((u) => (
                      <SelectItem key={u.user_id} value={u.user_id}>
                        {u.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Field label="Skills (comma separated)" value={form["skills"] ?? ""} onChange={set("skills")} />
            <Field label="Interests (comma separated)" value={form["interests"] ?? ""} onChange={set("interests")} />
            <Field label="Certifications (comma separated)" value={form["certifications"] ?? ""} onChange={set("certifications")} />
            <div className="space-y-2">
              <Label htmlFor="resume">Resume (PDF)</Label>
              <Input id="resume" type="file" accept="application/pdf" onChange={onResume} />
              {form["resume_url"] && (
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <FileText className="h-3.5 w-3.5" /> Resume uploaded
                </p>
              )}
            </div>
          </>
        )}

        {role === "university" && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Institution name" value={form["name"] ?? ""} onChange={set("name")} />
              <Field label="Accreditation" value={form["accreditation"] ?? ""} onChange={set("accreditation")} />
              <Field label="Contact person" value={form["contact_person"] ?? ""} onChange={set("contact_person")} />
              <Field label="Contact phone" value={form["contact_phone"] ?? ""} onChange={set("contact_phone")} />
              <Field label="Website" value={form["website"] ?? ""} onChange={set("website")} />
            </div>
            <Field label="Address" value={form["address"] ?? ""} onChange={set("address")} />
            <Field label="Programs (comma separated)" value={form["programs"] ?? ""} onChange={set("programs")} />
          </>
        )}

        {role === "employer" && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Company name" value={form["company_name"] ?? ""} onChange={set("company_name")} />
              <Field label="Industry" value={form["industry"] ?? ""} onChange={set("industry")} />
              <Field label="Company size" value={form["company_size"] ?? ""} onChange={set("company_size")} />
              <Field label="Location" value={form["location"] ?? ""} onChange={set("location")} />
              <Field label="Website" value={form["website"] ?? ""} onChange={set("website")} />
              <Field label="HR contact name" value={form["hr_name"] ?? ""} onChange={set("hr_name")} />
              <Field label="HR email" type="email" value={form["hr_email"] ?? ""} onChange={set("hr_email")} />
              <Field label="HR phone" value={form["hr_phone"] ?? ""} onChange={set("hr_phone")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">About the company</Label>
              <Textarea id="description" rows={4} value={form["description"] ?? ""} onChange={set("description")} maxLength={2000} />
            </div>
          </>
        )}

        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save profile
        </Button>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input type={type} value={value} onChange={onChange} maxLength={255} />
    </div>
  );
}
