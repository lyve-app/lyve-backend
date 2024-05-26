import { StreamPeer } from "src/types/streamroom";

export const closePeer = (state: StreamPeer) => {
  state.producer?.close();
  state.recvTransport?.close();
  state.sendTransport?.close();
  state.consumers.forEach((c) => c.close());
};
