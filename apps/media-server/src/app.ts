/* eslint-disable @typescript-eslint/no-unused-vars */
import logger from "./middleware/logger";
import { Router, Worker } from "mediasoup/node/lib/types";
import { startMediasoup } from "./utils/startMediasoup";
import { StreamRoom } from "./types/streamroom";

const streams: StreamRoom = {};

export async function main() {
  // start mediasoup

  logger.info("Starting Mediasoup");
  let workers: {
    worker: Worker;
    router: Router;
  }[];
  try {
    workers = await startMediasoup();
  } catch (err) {
    console.log(err);
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

  const createStream = () => {
    const { worker, router } = getNextWorker();

    return { worker, router, state: {} };
  };
}
