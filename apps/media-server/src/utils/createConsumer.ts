import {
  Producer,
  Router,
  RtpCapabilities,
  Transport
} from "mediasoup/node/lib/types";
import { StreamPeer } from "../types/streamroom";
import { Consumer } from "../types/rabbitmq";
import logger from "../middleware/logger";

export const createConsumer = async (
  router: Router,
  producer: Producer,
  rtpCapabilities: RtpCapabilities,
  transport: Transport,
  peerId: string,
  peerConsuming: StreamPeer
): Promise<Consumer> => {
  if (!router.canConsume({ producerId: producer.id, rtpCapabilities })) {
    logger.error(`Client cannot consume ${producer.appData.peerId}`);
    throw new Error(`Client cannot consume ${producer.appData.peerId}`);
  }

  logger.info(`Creating  consumer for peer ${peerId}`);

  const consumer = await transport.consume({
    producerId: producer.id,
    rtpCapabilities,
    // paused: producer.kind === "video",
    paused: false,
    appData: { peerId, mediaPeerId: producer.appData.peerId }
  });

  peerConsuming.consumers.push(consumer);

  logger.info(
    `peer ${peerId} has: ${peerConsuming.consumers.length} consumers`
  );

  return {
    peerId: producer.appData.peerId as string,
    consumerParameters: {
      producerId: producer.id,
      id: consumer.id,
      kind: consumer.kind,
      rtpParameters: consumer.rtpParameters,
      type: consumer.type,
      producerPaused: consumer.producerPaused
    }
  };
};
