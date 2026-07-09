import { useEffect, useRef } from "react";
import { useMediasoup } from "../hooks/useMediasoup";

export const GroupCall = ({ roomId }: { roomId: string }) => {
  const {
    joinRoom,
    startProducing,
    setupListeners,
    remoteStreams,
  } = useMediasoup();

  const localVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const init = async () => {
      await joinRoom(roomId);
      setupListeners();

      const stream = await startProducing(true);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    };

    init();
  }, []);

  return (
    <div className="grid grid-cols-3 gap-2 p-4">
      {/* Local Video */}
      <video
        ref={localVideoRef}
        autoPlay
        muted
        playsInline
        className="w-full h-40 bg-black"
      />

      {/* Remote Videos */}
      {remoteStreams.map((stream, index) => (
        <Video key={index} stream={stream} />
      ))}
    </div>
  );
};

const Video = ({ stream }: { stream: MediaStream }) => {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <video
      ref={ref}
      autoPlay
      playsInline
      className="w-full h-40 bg-black"
    />
  );
};