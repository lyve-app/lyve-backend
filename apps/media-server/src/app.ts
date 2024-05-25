/* eslint-disable @typescript-eslint/no-unused-vars */
import logger from "./middleware/logger";
import { Router, Worker } from "mediasoup/node/lib/types";
import { startMediasoup } from "./utils/startMediasoup";

import { StreamRoom } from "./types/streamroom";
import { initRabbitMQ } from "./utils/initRabbitMQ";
import { Channel } from "amqplib";
import config from "./config/config";
import { createTransport } from "./utils/createTransport";

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

  const createStream = () => {
    const { worker, router } = getNextWorker();

    return { worker, router, state: {} };
  };

  await initRabbitMQ(config.rabbitmq.url, {
    "connect-as-streamer": async ({ streamId, peerId }, sid, send, errBack) => {
      if (!(streamId in streamRooms)) {
        streamRooms[streamId] = createStream();
      }
      logger.info("connect-as-streamer", peerId);

      const stream = streamRooms[streamId];
      if (!stream) {
        return errBack("connect-as-streamer", "Stream does not exist");
      }

      const { state, router } = stream;

      if (!state || !router) {
        logger.error("connect-as-streamer: state or router is undefined");
        errBack("onnect-as-streamer", "State or router is undefined");
      }

      const [recvTransport, sendTransport] = await Promise.all([
        createTransport(router, peerId, "recv"),
        createTransport(router, peerId, "send")
      ]);

      stream.state[peerId] = {
        recvTransport: recvTransport,
        sendTransport: sendTransport,
        consumers: [],
        producer: null
      };

      send({
        op: "you-connected-as-streamer",
        data: {
          streamId,
          peerId,
          routerRtpCapabilities: stream.router.rtpCapabilities,
          recvTransportOptions: recvTransport,
          sendTransportOptions: sendTransport
        },
        sid
      });
    },
    "connect-as-viewer": async () => {},
    "close-peer": () => {},
    "connect-transport": () => {},
    "send-track": () => {},
    "get-recv-tracks": () => {},
    "end-stream": () => {}
  });
}
