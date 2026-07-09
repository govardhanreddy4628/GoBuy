import { getWorker } from "./mediasoupServer.js";

const rooms = new Map();

export const createRoom = async (roomId: string) => {
  const worker = getWorker();

  const router = await worker.createRouter({
    mediaCodecs: [
      {
        kind: "audio",
        mimeType: "audio/opus",
        clockRate: 48000,
        channels: 2,
      },
      {
        kind: "video",
        mimeType: "video/VP8",
        clockRate: 90000,
      },
    ],
  });

  const room = {
    router,
    peers: new Map(),
  };

  rooms.set(roomId, room);
  return room;
};

export const getRoom = (roomId: string) => rooms.get(roomId);
