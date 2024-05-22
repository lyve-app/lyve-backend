/* eslint-disable @typescript-eslint/no-unused-vars */
import logger from "./middleware/logger";
import { Router, Worker } from "mediasoup/node/lib/types";
import { startMediasoup } from "./utils/startMediasoup";

import { StreamRoom } from "./types/streamroom";
import { initRabbitMQ } from "./utils/initRabbitMQ";
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

  await initRabbitMQ(config.rabbitmq.url, {
    "connect-as-streamer": async () => {},
    "connect-as-viewer": async () => {},
    "close-peer": () => {},
    "connect-transport": () => {},
    "send-track": () => {},
    "end-stream": () => {}
  });
}
