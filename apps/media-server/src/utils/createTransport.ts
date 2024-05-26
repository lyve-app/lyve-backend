import { Router, WebRtcTransport } from "mediasoup/node/lib/types";
import config from "../config/config";
import { StreamSendDirection } from "src/types/rabbitmq";
import logger from "../middleware/logger";

export const transportToOptions = ({
  id,
  iceParameters,
  iceCandidates,
  dtlsParameters
}: WebRtcTransport) => ({ id, iceParameters, iceCandidates, dtlsParameters });

export type TransportOptions = ReturnType<typeof transportToOptions>;

export const createTransport = async (
  router: Router,
  peerId: string,
  direction: StreamSendDirection
): Promise<WebRtcTransport> => {
  logger.info(`Creating ${direction} transport for peer ${peerId}`);
  const transport = await router.createWebRtcTransport({
    listenIps: config.mediasoup.webRtcTransport.listenIps,
    enableUdp: true,
    enableTcp: true,
    preferUdp: true,
    appData: { peerId, clientDirection: direction }
  });
  return transport;
};
