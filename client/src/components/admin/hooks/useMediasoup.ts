import { useRef, useState } from "react";
import {
  Device,
  types as mediasoupTypes,
} from "mediasoup-client";
import { socket } from "../socket";

export const useMediasoup = () => {
  // ✅ Proper typings
  const deviceRef = useRef<Device | null>(null);
  const sendTransportRef = useRef<mediasoupTypes.Transport | null>(null);
  const recvTransportRef = useRef<mediasoupTypes.Transport | null>(null);

  const producersRef = useRef<mediasoupTypes.Producer[]>([]);
  const consumersRef = useRef<mediasoupTypes.Consumer[]>([]);

  const [remoteStreams, setRemoteStreams] = useState<MediaStream[]>([]);

  // 🏠 JOIN ROOM
  const joinRoom = async (roomId: string) => {
    const data = await new Promise<{
      rtpCapabilities: mediasoupTypes.RtpCapabilities;
    }>((res) => {
      socket.emit("joinRoom", { roomId }, res);
    });

    const device = new Device();

    await device.load({
      routerRtpCapabilities: data.rtpCapabilities,
    });

    deviceRef.current = device;

    await createSendTransport();
    await createRecvTransport();
  };

  // 🚚 CREATE SEND TRANSPORT
  const createSendTransport = async () => {
    if (!deviceRef.current) throw new Error("Device not initialized");

    const params = await new Promise<mediasoupTypes.TransportOptions>((res) => {
      socket.emit("createTransport", {}, res);
    });

    const transport = deviceRef.current.createSendTransport(params);

    transport.on(
      "connect",
      (
        { dtlsParameters }: { dtlsParameters: mediasoupTypes.DtlsParameters },
        callback: () => void,
        errback: (error: Error) => void
      ) => {
        try {
          socket.emit("connectTransport", {
            transportId: transport.id,
            dtlsParameters,
          });
          callback();
        } catch (err) {
          errback(err as Error);
        }
      }
    );

    transport.on(
      "produce",
      async (
        {
          kind,
          rtpParameters,
        }: {
          kind: mediasoupTypes.MediaKind;
          rtpParameters: mediasoupTypes.RtpParameters;
        },
        callback: ({ id }: { id: string }) => void,
        errback: (error: Error) => void
      ) => {
        try {
          const { id } = await new Promise<{ id: string }>((res) => {
            socket.emit("produce", { kind, rtpParameters }, res);
          });

          callback({ id });
        } catch (err) {
          errback(err as Error);
        }
      }
    );

    sendTransportRef.current = transport;
  };

  // 👀 CREATE RECEIVE TRANSPORT
  const createRecvTransport = async () => {
    if (!deviceRef.current) throw new Error("Device not initialized");

    const params = await new Promise<mediasoupTypes.TransportOptions>((res) => {
      socket.emit("createTransport", {}, res);
    });

    const transport = deviceRef.current.createRecvTransport(params);

    transport.on(
      "connect",
      (
        { dtlsParameters }: { dtlsParameters: mediasoupTypes.DtlsParameters },
        callback: () => void,
        errback: (error: Error) => void
      ) => {
        try {
          socket.emit("connectTransport", {
            transportId: transport.id,
            dtlsParameters,
          });
          callback();
        } catch (err) {
          errback(err as Error);
        }
      }
    );

    recvTransportRef.current = transport;
  };

  // 🎥 START VIDEO/AUDIO
  const startProducing = async (video: boolean) => {
    if (!sendTransportRef.current)
      throw new Error("Send transport not ready");

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video,
    });

    for (const track of stream.getTracks()) {
      const producer = await sendTransportRef.current.produce({ track });
      producersRef.current.push(producer);
    }

    return stream;
  };

  // 👀 HANDLE NEW PRODUCER
  const handleNewProducer = async (producerId: string) => {
    if (!deviceRef.current || !recvTransportRef.current)
      throw new Error("Device or transport not ready");

    const data = await new Promise<{
      id: string;
      producerId: string;
      kind: mediasoupTypes.MediaKind;
      rtpParameters: mediasoupTypes.RtpParameters;
    }>((res) => {
      socket.emit(
        "consume",
        {
          producerId,
          rtpCapabilities: deviceRef.current!.rtpCapabilities,
        },
        res
      );
    });

    const consumer = await recvTransportRef.current.consume({
      id: data.id,
      producerId: data.producerId,
      kind: data.kind,
      rtpParameters: data.rtpParameters,
    });

    const stream = new MediaStream();
    stream.addTrack(consumer.track);

    consumersRef.current.push(consumer);

    setRemoteStreams((prev) => [...prev, stream]);
  };

  // 📡 LISTEN EVENTS
  const setupListeners = () => {
    socket.on("newProducer", async ({ producerId }: { producerId: string }) => {
      await handleNewProducer(producerId);
    });
  };

  // ❌ CLEANUP
  const leaveRoom = () => {
    producersRef.current.forEach((p) => p.close());
    consumersRef.current.forEach((c) => c.close());

    sendTransportRef.current?.close();
    recvTransportRef.current?.close();

    setRemoteStreams([]);
  };

  return {
    joinRoom,
    startProducing,
    setupListeners,
    remoteStreams,
    leaveRoom,
  };
};