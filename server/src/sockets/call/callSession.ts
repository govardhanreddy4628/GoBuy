type CallSession = {
  caller: string;
  receiver: string;
  status: "ringing" | "connected";
  startedAt?: number;
};

const activeCalls = new Map<string, CallSession>();

export const createCall = (caller: string, receiver: string) => {
  const callId = `${caller}-${receiver}`;

  activeCalls.set(callId, {
    caller,
    receiver,
    status: "ringing",
  });

  return callId;
};

export const getCall = (callId: string) => activeCalls.get(callId);

export const setCallConnected = (callId: string) => {
  const call = activeCalls.get(callId);
  if (call) {
    call.status = "connected";
    call.startedAt = Date.now();
  }
};

export const endCallSession = (callId: string) => {
  activeCalls.delete(callId);
};