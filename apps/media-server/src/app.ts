/* eslint-disable @typescript-eslint/no-unused-vars */
import logger from "./middleware/logger";
import { Router, Worker } from "mediasoup/node/lib/types";
import { startMediasoup } from "./utils/startMediasoup";
import {
  connectConsumerTransport,
  connectProducerTransport,
  createConsumer,
  createProducer,
  createStream,
  endStream,
  leaveStream
} from "./utils/mediasoupHandlers";
import { StreamRoom } from "./types/streamroom";
import { initRabbitMQ } from "./utils/initRabbitMQ";
import { MediaServerEventType } from "./types/rabbitmq";
import { Channel } from "amqplib";
import config from "./config/config";

const streamRooms: StreamRoom = {};

export async function main() {
  // start mediasoup

  logger.info("Starting Mediasoup");

  let workers: Array<{
    worker: Worker;
    router: Router;
  }>;

  try {
    workers = await startMediasoup();
  } catch (err) {
    logger.error("Error on startMediasoup: ", err);
    throw err;
  }

  let currentWorkerIdx = 0;

  const getNextWorker = (): {
    worker: Worker;
    router: Router;
  } => {
    const w = workers[currentWorkerIdx];
    currentWorkerIdx++;
    currentWorkerIdx %= workers.length;

    if (w === undefined) {
      throw new Error();
    }
    return w;
  };

  let channel: Channel;

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  await initRabbitMQ(config.rabbitmq.url, channel, async (data) => {
    switch (data.type) {
      case MediaServerEventType.CREATE_STREAM: {
        const { worker, router } = getNextWorker();
        await createStream(data, worker, router, streamRooms);
        break;
      }
      case MediaServerEventType.CREATE_PRODUCER:
        await createProducer(data, channel, streamRooms);
        break;
      case MediaServerEventType.CONNECT_PRODUCER_TRANSPORT:
        await connectProducerTransport(data, channel, streamRooms);
        break;
      case MediaServerEventType.CREATE_CONSUMER:
        await createConsumer(data, channel, streamRooms);
        break;
      case MediaServerEventType.CONNECT_CONSUMER_TRANSPORT:
        await connectConsumerTransport(data, channel, streamRooms);
        break;
      case MediaServerEventType.END_STREAM:
        await endStream(data, streamRooms);
        break;
      case MediaServerEventType.LEAVE_STREAM:
        await leaveStream(data, streamRooms);
        break;
      default:
        logger.error("Unknown message type:", data);
    }
  });
}
