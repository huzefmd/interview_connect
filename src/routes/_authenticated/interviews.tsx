import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useUser, useMyRole } from "@/hooks/useAuth";
import { PageHeader } from "@/components/dashboards/StatCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/interviews")({
  head: () => ({
    meta: [
      { title: "Your JobSync interviews" },
      { name: "description", content: "Join scheduled interviews and review past interview feedback." },
      { property: "og:title", content: "Your JobSync interviews" },
      { property: "og:description", content: "Join scheduled interviews and review past interview feedback." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: InterviewsPage,
});

function InterviewsPage() {
  const { user } = useUser();
  const { data: role } = useMyRole(user?.id);
  const queryClient = useQueryClient();
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery({
    queryKey: ["interviews", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("interviews")
        .select("*, jobs(title)")
        .order("scheduled_at", { ascending: false });
      return data ?? [];
    },
  });

  async function saveFeedback(id: string) {
    const feedback = drafts[id] ?? "";
    const { error } = await supabase.from("interviews").update({ feedback, status: "completed" }).eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Feedback saved");
    queryClient.invalidateQueries({ queryKey: ["interviews", user?.id] });
  }

  if (isLoading) return <Skeleton className="h-96 w-full" />;

  return (
    <div>
      <PageHeader title="Interviews" subtitle="Everything scheduled, live and completed." />
      <div className="space-y-4">
        {(data ?? []).length === 0 && <p className="text-sm text-muted-foreground">No interviews yet.</p>}
        {(data ?? []).map((i) => (
          <article key={i.id} className="rounded-2xl border border-border bg-card p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-bold text-foreground">{i.jobs?.title ?? "Interview"}</h2>
                <p className="text-sm text-muted-foreground">
                  {new Date(i.scheduled_at).toLocaleString()} · {i.duration_minutes} min
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="capitalize">
                  {i.status.replace("_", " ")}
                </Badge>
                {i.status !== "completed" && i.status !== "cancelled" && (
                  <Button asChild size="sm">
                    <Link to="/interview/$id" params={{ id: i.id }}>
                      Join interview
                    </Link>
                  </Button>
                )}
              </div>
            </div>

            {i.feedback && <p className="mt-4 rounded-xl bg-muted p-3 text-sm text-muted-foreground">{i.feedback}</p>}

            {role === "employer" && !i.feedback && (
              <div className="mt-4 space-y-2">
                <Textarea
                  rows={3}
                  placeholder="Post-interview feedback"
                  value={drafts[i.id] ?? ""}
                  onChange={(e) => setDrafts((d) => ({ ...d, [i.id]: e.target.value }))}
                  maxLength={2000}
                />
                <Button size="sm" onClick={() => saveFeedback(i.id)}>
                  Save feedback
                </Button>
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
