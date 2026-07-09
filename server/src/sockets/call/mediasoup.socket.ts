import { Server, Socket } from "socket.io";
import { createRoom, getRoom } from "./mediasoup/mediasoupRoom.js";

export const initMediasoupSocket = (io: Server, socket: Socket) => {
  console.log("🎥 Mediasoup socket:", socket.id);

  let currentRoom: any;
  let transports: any[] = [];
  let producers: any[] = [];
  let consumers: any[] = [];

  // 🏠 JOIN ROOM
  socket.on("joinRoom", async ({ roomId }, callback) => {
    let room = getRoom(roomId);

    if (!room) {
      room = await createRoom(roomId);
    }

    currentRoom = room;

    callback({
      rtpCapabilities: room.router.rtpCapabilities,
    });
  });

  // 🚚 CREATE TRANSPORT
  socket.on("createTransport", async (_, callback) => {
    const transport = await currentRoom.router.createWebRtcTransport({
      listenIps: [{ ip: "0.0.0.0", announcedIp: process.env.PUBLIC_IP }],
      enableUdp: true,
      enableTcp: true,
    });

    transports.push(transport);

    callback({
      id: transport.id,
      iceParameters: transport.iceParameters,
      iceCandidates: transport.iceCandidates,
      dtlsParameters: transport.dtlsParameters,
    });
  });

  // 🔗 CONNECT TRANSPORT
  socket.on("connectTransport", async ({ transportId, dtlsParameters }) => {
    const transport = transports.find((t) => t.id === transportId);
    await transport.connect({ dtlsParameters });
  });

  // 🎥 PRODUCE
  socket.on("produce", async ({ kind, rtpParameters }, callback) => {
    const transport = transports[0];

    const producer = await transport.produce({
      kind,
      rtpParameters,
    });

    producers.push(producer);

    socket.broadcast.emit("newProducer", {
      producerId: producer.id,
    });

    callback({ id: producer.id });
  });

  // 👀 CONSUME
  socket.on("consume", async ({ producerId, rtpCapabilities }, callback) => {
    const transport = transports[0];

    const consumer = await transport.consume({
      producerId,
      rtpCapabilities,
      paused: false,
    });

    consumers.push(consumer);

    callback({
      id: consumer.id,
      producerId,
      kind: consumer.kind,
      rtpParameters: consumer.rtpParameters,
    });
  });

  socket.on("disconnect", () => {
    transports.forEach((t) => t.close());
    producers.forEach((p) => p.close());
    consumers.forEach((c) => c.close());
  });
};
