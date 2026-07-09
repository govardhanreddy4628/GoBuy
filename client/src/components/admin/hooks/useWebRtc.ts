import { useRef, useState } from "react";
import { socket } from "../socket";

export const useWebRTC = (myId: string) => {
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);

  const currentTargetRef = useRef<string>("");

  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  // ✅ Create PeerConnection
  const createPeerConnection = () => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    // 🎥 Receive remote tracks
    pc.ontrack = (event: RTCTrackEvent) => {
      const stream = event.streams[0];
      if (!stream) return;

      remoteStreamRef.current = stream;
      setRemoteStream(stream);
    };

    // ❄️ ICE candidate
    pc.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
      if (event.candidate && currentTargetRef.current) {
        socket.emit("ice:candidate", {
          to: currentTargetRef.current,
          candidate: event.candidate,
        });
      }
    };

    pcRef.current = pc;
    return pc;
  };

  // 🎥 Start local media
  const startLocalStream = async (video: boolean) => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video,
    });

    localStreamRef.current = stream;
    return stream;
  };

  // 📞 CALL USER
  const callUser = async (targetId: string, video: boolean) => {
    currentTargetRef.current = targetId;

    const pc = createPeerConnection();
    const stream = await startLocalStream(video);

    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
    });

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    socket.emit("call:user", {
      to: targetId,
      from: myId,
      offer,
    });

    return stream;
  };

  // 📲 RECEIVE CALL
  const handleIncomingCall = async (
    from: string,
    offer: RTCSessionDescriptionInit,
    video: boolean
  ) => {
    currentTargetRef.current = from;

    const pc = createPeerConnection();
    const stream = await startLocalStream(video);

    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
    });

    await pc.setRemoteDescription(new RTCSessionDescription(offer));

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    socket.emit("call:accept", {
      to: from,
      answer,
    });

    return stream;
  };

  // ✅ CALL ACCEPTED
  const handleCallAccepted = async (answer: RTCSessionDescriptionInit) => {
    if (!pcRef.current) return;

    await pcRef.current.setRemoteDescription(
      new RTCSessionDescription(answer)
    );
  };

  // 🔁 ICE
  const handleIceCandidate = async (candidate: RTCIceCandidateInit) => {
    if (!pcRef.current) return;

    try {
      await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
      console.error("ICE error:", err);
    }
  };

  // 📞 END CALL
  const endCall = () => {
    pcRef.current?.close();
    pcRef.current = null;

    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    remoteStreamRef.current?.getTracks().forEach((t) => t.stop());

    localStreamRef.current = null;
    remoteStreamRef.current = null;

    setRemoteStream(null);
    currentTargetRef.current = "";
  };

  return {
    callUser,
    handleIncomingCall,
    handleCallAccepted,
    handleIceCandidate,
    endCall,
    localStreamRef,
    remoteStream,
  };
};