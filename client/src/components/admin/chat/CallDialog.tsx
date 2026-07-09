import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent } from "../../../ui/dialog";
import { Button } from "../../../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../../ui/avatar";
//import { toast } from "../../../ui/use-toast";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Volume2,
  VolumeX,
  Users,
} from "lucide-react";
import { GroupCall } from "./GroupCall";

interface CallDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "audio" | "video";
  chatName: string;
  avatar?: string;
  isGroup?: boolean;
  roomId?: string; // Optional roomId for the call
}

type Status = "ringing" | "connected" | "ended";

function formatDuration(sec: number) {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = (sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function CallDialog({
  open,
  onOpenChange,
  mode,
  chatName,
  avatar,
  isGroup,
  roomId,
}: CallDialogProps) {
  const [status, setStatus] = useState<Status>("ringing");
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [videoOn, setVideoOn] = useState(mode === "video");
  const [speakerOn, setSpeakerOn] = useState(true);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Reset on open
  useEffect(() => {
    if (open) {
      setStatus("ringing");
      setDuration(0);
      setMuted(false);
      setVideoOn(mode === "video");
      setSpeakerOn(true);
    }
  }, [open, mode]);

  // Simulate ringing -> connected
  useEffect(() => {
    if (!open || status !== "ringing") return;
    const t = setTimeout(() => setStatus("connected"), 2000);
    return () => clearTimeout(t);
  }, [open, status]);

  // Duration timer
  useEffect(() => {
    if (status !== "connected") return;
    const i = setInterval(() => setDuration((d) => d + 1), 1000);
    return () => clearInterval(i);
  }, [status]);

  // Request camera/mic for video calls
  // useEffect(() => {
  //   let cancelled = false;
  //   async function start() {
  //     if (!open || mode !== "video" || !videoOn) return;
  //     try {
  //       const stream = await navigator.mediaDevices.getUserMedia({
  //         video: true,
  //         audio: true,
  //       });
  //       if (cancelled) {
  //         stream.getTracks().forEach((t) => t.stop());
  //         return;
  //       }
  //       streamRef.current = stream;
  //       if (localVideoRef.current) {
  //         localVideoRef.current.srcObject = stream;
  //       }
  //     } catch {
  //       toast({
  //         title: "Camera unavailable",
  //         description: "Continuing without local video preview.",
  //       });
  //     }
  //   }
  //   start();
  //   return () => {
  //     cancelled = true;
  //     streamRef.current?.getTracks().forEach((t) => t.stop());
  //     streamRef.current = null;
  //   };
  // }, [open, mode, videoOn]);

  const endCall = () => {
    setStatus("ended");
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    // toast({
    //   title: "Call ended",
    //   description: `${mode === "video" ? "Video" : "Voice"} call with ${chatName} • ${formatDuration(duration)}`,
    // });
    setTimeout(() => onOpenChange(false), 200);
  };

  const initials = chatName.split(" ").map((n) => n[0]).join("").slice(0, 2);

  return (
    <Dialog open={open} onOpenChange={(o) => (!o ? endCall() : onOpenChange(o))}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-0">
        <div className="relative bg-gradient-to-b from-primary/20 via-background to-background">
          {/* Video preview area */}
          <div className="relative h-80 flex items-center justify-center bg-muted/40">
            {mode === "video" && videoOn ? (
              <>
                {/* <div className="absolute inset-0 bg-black" />
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="relative z-10 h-full w-full object-cover"
                />
                <div className="absolute top-3 left-3 z-20 px-2 py-1 rounded bg-black/50 text-white text-xs">
                  You
                </div> */}
                <GroupCall roomId={roomId} />
              </>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={avatar} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    {isGroup ? <Users className="h-10 w-10" /> : initials}
                  </AvatarFallback>
                </Avatar>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="text-center py-4 px-6">
            <h2 className="text-lg font-semibold text-foreground">{chatName}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {status === "ringing" && `${mode === "video" ? "Video calling" : "Calling"}...`}
              {status === "connected" && `${mode === "video" ? "Video call" : "Voice call"} • ${formatDuration(duration)}`}
              {status === "ended" && "Call ended"}
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3 pb-6 px-6">
            <Button
              type="button"
              variant={muted ? "default" : "secondary"}
              size="icon"
              className="rounded-full h-12 w-12"
              onClick={() => setMuted((m) => !m)}
              aria-label={muted ? "Unmute" : "Mute"}
            >
              {muted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>

            {mode === "video" && (
              <Button
                type="button"
                variant={videoOn ? "secondary" : "default"}
                size="icon"
                className="rounded-full h-12 w-12"
                onClick={() => setVideoOn((v) => !v)}
                aria-label={videoOn ? "Turn camera off" : "Turn camera on"}
              >
                {videoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
              </Button>
            )}

            <Button
              type="button"
              variant={speakerOn ? "secondary" : "default"}
              size="icon"
              className="rounded-full h-12 w-12"
              onClick={() => setSpeakerOn((s) => !s)}
              aria-label={speakerOn ? "Speaker off" : "Speaker on"}
            >
              {speakerOn ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </Button>

            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="rounded-full h-12 w-12"
              onClick={endCall}
              aria-label="End call"
            >
              <PhoneOff className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
