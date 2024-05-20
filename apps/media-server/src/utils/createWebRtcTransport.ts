import { Router, WebRtcTransport } from "mediasoup/node/lib/types";
import config from "../config/config";

export const createWebRtcTransport = async (
  router: Router
): Promise<WebRtcTransport> => {
  const transport = await router.createWebRtcTransport({
    listenIps: config.mediasoup.webRtcTransport.listenIps,
    enableUdp: true,
    enableTcp: true,
    preferUdp: true
  });
  return transport;
};
