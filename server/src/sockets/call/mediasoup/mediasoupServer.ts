import mediasoup from "mediasoup";

let worker: any;

export const createWorker = async () => {
  worker = await mediasoup.createWorker({
    rtcMinPort: 40000,
    rtcMaxPort: 49999,
  });

  console.log("✅ Mediasoup Worker created");

  return worker;
};

export const getWorker = () => worker;