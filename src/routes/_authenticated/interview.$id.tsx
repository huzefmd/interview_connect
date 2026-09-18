import { useEffect, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Mic, MicOff, Video, VideoOff, MonitorUp, PhoneOff, Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_authenticated/interview/$id")({
  head: () => ({
    meta: [
      { title: "Live interview room | JobSync" },
      { name: "description", content: "Join your live in-app interview with video, chat and screen sharing." },
      { property: "og:title", content: "Live interview room | JobSync" },
      { property: "og:description", content: "Join your live in-app interview with video, chat and screen sharing." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: InterviewRoom,
});

const ICE = { iceServers: [{ urls: ["stun:stun.l.google.com:19302", "stun:global.stun.twilio.com:3478"] }] };

function InterviewRoom() {
  const { id } = Route.useParams();
  const { user } = useUser();
  const navigate = useNavigate();
  const localRef = useRef<HTMLVideoElement>(null);
  const remoteRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [connected, setConnected] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [seconds, setSeconds] = useState(0);
  const [messages, setMessages] = useState<{ id: string; sender_id: string; body: string }[]>([]);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const channel = supabase.channel(`interview-${id}`, { config: { broadcast: { self: false } } });

    async function start() {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (cancelled) return stream.getTracks().forEach((t) => t.stop());
      streamRef.current = stream;
      if (localRef.current) localRef.current.srcObject = stream;

      const pc = new RTCPeerConnection(ICE);
      pcRef.current = pc;
      stream.getTracks().forEach((t) => pc.addTrack(t, stream));
      pc.ontrack = (e) => {
        if (remoteRef.current) remoteRef.current.srcObject = e.streams[0] ?? null;
        setConnected(true);
      };
      pc.onicecandidate = (e) => {
        if (e.candidate) channel.send({ type: "broadcast", event: "ice", payload: e.candidate.toJSON() });
      };

      channel
        .on("broadcast", { event: "ready" }, async () => {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          channel.send({ type: "broadcast", event: "offer", payload: offer });
        })
        .on("broadcast", { event: "offer", }, async ({ payload }) => {
          await pc.setRemoteDescription(new RTCSessionDescription(payload));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          channel.send({ type: "broadcast", event: "answer", payload: answer });
        })
        .on("broadcast", { event: "answer" }, async ({ payload }) => {
          if (!pc.currentRemoteDescription) await pc.setRemoteDescription(new RTCSessionDescription(payload));
        })
        .on("broadcast", { event: "ice" }, async ({ payload }) => {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(payload));
          } catch {
            /* ignore late candidates */
          }
        })
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "interview_messages", filter: `interview_id=eq.${id}` },
          ({ new: row }) => setMessages((m) => [...m, row as { id: string; sender_id: string; body: string }]),
        )
        .subscribe((status) => {
          if (status === "SUBSCRIBED") channel.send({ type: "broadcast", event: "ready", payload: {} });
        });

      await supabase.from("interviews").update({ status: "in_progress", started_at: new Date().toISOString() }).eq("id", id);
      const { data } = await supabase.from("interview_messages").select("*").eq("interview_id", id).order("created_at");
      setMessages(data ?? []);
    }

    start().catch((e) => toast.error(e instanceof Error ? e.message : "Could not start camera"));

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
      pcRef.current?.close();
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [id, user]);

  function toggleMic() {
    const track = streamRef.current?.getAudioTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setMicOn(track.enabled);
  }

  function toggleCam() {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setCamOn(track.enabled);
  }

  async function shareScreen() {
    try {
      const display = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const track = display.getVideoTracks()[0];
      const sender = pcRef.current?.getSenders().find((s) => s.track?.kind === "video");
      if (track && sender) {
        await sender.replaceTrack(track);
        track.onended = () => {
          const cam = streamRef.current?.getVideoTracks()[0];
          if (cam) sender.replaceTrack(cam);
        };
      }
    } catch {
      toast.error("Screen share cancelled");
    }
  }

  async function endCall() {
    await supabase.from("interviews").update({ status: "completed", ended_at: new Date().toISOString() }).eq("id", id);
    navigate({ to: "/interviews" });
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim() || !user) return;
    const body = draft.trim().slice(0, 1000);
    setDraft("");
    const { data, error } = await supabase
      .from("interview_messages")
      .insert({ interview_id: id, sender_id: user.id, body })
      .select()
      .single();
    if (error) {
      toast.error(error.message);
      return;
    }
    setMessages((m) => (m.some((x) => x.id === data.id) ? m : [...m, data]));
  }

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div>
        <div className="relative overflow-hidden rounded-2xl bg-foreground/90">
          <video ref={remoteRef} autoPlay playsInline className="aspect-video w-full object-cover" />
          {!connected && (
            <p className="absolute inset-0 flex items-center justify-center text-sm text-background">
              Waiting for the other participant to join…
            </p>
          )}
          <video
            ref={localRef}
            autoPlay
            playsInline
            muted
            className="absolute bottom-4 right-4 w-40 rounded-xl border border-background/30 object-cover"
          />
          <span className="absolute left-4 top-4 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold">
            {mm}:{ss}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <Button variant={micOn ? "outline" : "destructive"} size="icon" onClick={toggleMic} aria-label="Toggle microphone">
            {micOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
          </Button>
          <Button variant={camOn ? "outline" : "destructive"} size="icon" onClick={toggleCam} aria-label="Toggle camera">
            {camOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
          </Button>
          <Button variant="outline" size="icon" onClick={shareScreen} aria-label="Share screen">
            <MonitorUp className="h-4 w-4" />
          </Button>
          <Button variant="destructive" onClick={endCall}>
            <PhoneOff className="mr-2 h-4 w-4" />
            End interview
          </Button>
        </div>
      </div>

      <aside className="flex h-[70vh] flex-col rounded-2xl border border-border bg-card p-4">
        <h2 className="font-bold text-foreground">Chat</h2>
        <div className="mt-3 flex-1 space-y-2 overflow-y-auto">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                m.sender_id === user?.id ? "ml-auto bg-primary text-primary-foreground" : "bg-muted text-foreground"
              }`}
            >
              {m.body}
            </div>
          ))}
        </div>
        <form onSubmit={send} className="mt-3 flex gap-2">
          <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Message" maxLength={1000} />
          <Button type="submit" size="icon" aria-label="Send message">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </aside>
    </div>
  );
}
