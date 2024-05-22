import { Router, WebRtcTransport } from "mediasoup/node/lib/types";
import config from "../config/config";
import { StreamSendDirection } from "src/types/rabbitmq";

export const createTransport = async (
  router: Router,
  sid: string,
  direction: StreamSendDirection
): Promise<WebRtcTransport> => {
  const transport = await router.createWebRtcTransport({
    listenIps: config.mediasoup.webRtcTransport.listenIps,
    enableUdp: true,
    enableTcp: true,
    preferUdp: true,
    appData: { sid, clientDirection: direction }
  });
  return transport;
};
