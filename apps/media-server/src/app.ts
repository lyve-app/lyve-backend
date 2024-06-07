/* eslint-disable @typescript-eslint/no-unused-vars */
import logger from "./middleware/logger";
import { Router, Worker } from "mediasoup/node/lib/types";
import { startMediasoup } from "./utils/startMediasoup";

import { StreamRoom } from "./types/streamroom";
import { initRabbitMQ } from "./utils/initRabbitMQ";

import config from "./config/config";
import { createTransport, transportToOptions } from "./utils/createTransport";
import { closePeer } from "./utils/closePeer";
import { createConsumer } from "./utils/createConsumer";

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
        errBack("connect-as-streamer", "State or router is undefined");
        return;
      }

      const [recvTransport, sendTransport] = await Promise.all([
        createTransport(router, peerId, "recv"),
        createTransport(router, peerId, "send")
      ]);

      stream.state[peerId] = {
        recvTransport: recvTransport,
        sendTransport: sendTransport,
        consumers: [],
        producers: []
      };

      send({
        op: "you-connected-as-streamer",
        data: {
          streamId,
          peerId,
          routerRtpCapabilities: stream.router.rtpCapabilities,
          recvTransportOptions: transportToOptions(recvTransport),
          sendTransportOptions: transportToOptions(sendTransport)
        },
        sid
      });
    },
    "connect-as-viewer": async ({ streamId, peerId }, sid, send, errBack) => {
      const stream = streamRooms[streamId];
      if (!stream) {
        logger.error(
          `connect-as-viewer: Stream with id: ${streamId} was not found`
        );
        errBack(
          "connect-as-viewer",
          `Stream with id: ${streamId} was not found`
        );
        return;
      }

      logger.info("connect-as-viewer", peerId);

      const { state, router } = stream;

      if (!state || !router) {
        logger.error("connect-as-viewer: state or router is undefined");
        errBack("connect-as-viewer", "State or router is undefined");
        return;
      }

      const recvTransport = await createTransport(router, peerId, "recv");

      const peer = state[peerId];
      if (peer) {
        closePeer(peer);
      }

      stream.state[peerId] = {
        recvTransport,
        consumers: [],
        producers: [],
        sendTransport: null
      };

      send({
        op: "you-connected-as-viewer",
        data: {
          streamId,
          peerId,
          routerRtpCapabilities: router.rtpCapabilities,
          recvTransportOptions: transportToOptions(recvTransport)
        },
        sid
      });
    },
    "close-peer": ({ streamId, peerId }, sid, send) => {
      const stream = streamRooms[streamId];
      if (stream) {
        const { state } = stream;
        const peer = state[peerId];

        logger.info(`Closing peer ${peerId}`);

        if (peer) {
          // close and remove peer
          closePeer(peer);
          delete state[peerId];
        }
        // delete stream if no peers are connected to it
        if (Object.keys(stream.state).length === 0) {
          delete streamRooms[streamId];
        }

        send({ sid, op: "you-left-stream", data: { streamId } });
      }
    },
    "connect-transport": async (
      { streamId, peerId, dtlsParameters, direction },
      sid,
      send,
      errBack
    ) => {
      const stream = streamRooms[streamId];
      if (!stream) {
        logger.error(
          `connect-transport: Stream with id: ${streamId} was not found`
        );
        errBack(
          "connect-transport",
          `Stream with id: ${streamId} was not found`
        );
        return;
      }

      const { state } = stream;

      if (!state) {
        logger.error("connect-transport: state is undefined");
        errBack("connect-transport", "state is undefined");
        return;
      }

      const peer = state[peerId];

      if (!peer) {
        logger.error("connect-transport: peer not found");
        errBack("connect-transport", "peer not found");
        return;
      }

      const transport =
        direction === "recv" ? peer.recvTransport : peer.sendTransport;

      if (!transport) {
        logger.error(
          `connect-transport: ${direction} transport is undefined or null`
        );
        errBack(
          "connect-transport",
          `${direction} transport is undefined or null`
        );
        return;
      }

      logger.info("connect-transport", peerId, direction, transport.appData);

      try {
        await transport.connect({ dtlsParameters });
      } catch (err) {
        const e = err as Error;
        send({
          op: `connect-transport-${direction}-res` as const,
          sid,
          data: {
            error: e.message,
            streamId
          }
        });

        errBack(e.name, e.message);

        return;
      }
      send({
        op: `connect-transport-${direction}-res`,
        sid,
        data: { streamId }
      });
    },
    "get-recv-tracks": async (
      { streamId, peerId, rtpCapabilities },
      sid,
      send,
      errBack
    ) => {
      const stream = streamRooms[streamId];
      if (!stream) {
        logger.error(
          `get-recv-tracks: Stream with id: ${streamId} was not found`
        );
        errBack("get-recv-tracks", `Stream with id: ${streamId} was not found`);
        return;
      }

      const { state, router } = stream;

      if (!state || !router) {
        logger.error("get-recv-tracks: state or router is undefined");
        errBack("get-recv-tracks", "state or router is undefined");
        return;
      }

      const peer = state[peerId];

      if (!peer) {
        logger.error("get-recv-tracks: peer not found");
        errBack("get-recv-tracks", "peer not found");
        return;
      }

      const recvTransport = peer.recvTransport;

      if (!recvTransport) {
        logger.error("get-recv-tracks: recvTransport is undefined or null");
        errBack("get-recv-tracks", "recvTransport is undefined or null");
        return;
      }

      const consumerParametersArr = [];

      for (const pid of Object.keys(state)) {
        const peerState = state[pid];

        if (!peerState || !peerState.producers.length) {
          continue;
        }
        try {
          const { producers } = peerState;
          for (const producer of producers) {
            logger.info(
              `Creating a ${producer.kind} consumer to consume producer: ${producer.id} for stream ${streamId}`
            );
            const c = await createConsumer(
              router,
              producer,
              rtpCapabilities,
              recvTransport,
              pid,
              peerState
            );
            consumerParametersArr.push(c);
          }
        } catch (e) {
          errBack(((e as Error).name, (e as Error).message));
          continue;
        }
      }

      send({
        op: "get-recv-tracks-res",
        sid,
        data: { consumerParametersArr, streamId }
      });
    },
    "send-track": async (
      {
        streamId,
        peerId,
        transportId,
        direction,
        paused,
        kind,
        rtpParameters,
        appData
      },
      sid,
      send,
      errBack
    ) => {
      const stream = streamRooms[streamId];
      if (!stream) {
        logger.error(`send-track: Stream with id: ${streamId} was not found`);
        errBack("send-track", `Stream with id: ${streamId} was not found`);
        return;
      }

      const { state } = stream;

      if (!state) {
        logger.error("send-track: state is undefined");
        errBack("send-track", "state is undefined");
        return;
      }

      const peer = state[peerId];

      if (!peer) {
        logger.error("send-track: peer not found");
        errBack("send-track", "peer not found");
        return;
      }

      const { sendTransport, producers: prevProducers, consumers } = peer;

      if (!sendTransport) {
        logger.error("send-track: sendTransport is undefined or null");
        errBack("send-track", "sendTransport is undefined or null");
        return;
      }

      try {
        // if (prevProducer) {
        //   prevProducer.close();
        //   consumers.forEach((c) => c.close());

        //   send({
        //     streamId,
        //     op: "close-consumer",
        //     data: { producerId: prevProducer.id, streamId }
        //   });
        // }

        logger.info(`Creating a ${kind} producer for stream ${streamId}`);
        const producer = await sendTransport.produce({
          kind,
          rtpParameters,
          paused,
          appData: { ...appData, peerId: peerId, transportId }
        });

        logger.info(
          `Successfully created producer kind: (${producer.kind}): ${producer.id}`
        );

        peer.producers.push(producer);

        send({
          op: `send-track-${direction}-res`,
          data: {
            id: producer.id,
            streamId
          },
          sid
        });
      } catch (error) {
        const e = error as Error;
        send({
          op: `send-track-${direction}-res`,
          sid,
          data: {
            error: e.message,
            streamId
          }
        });

        send({
          op: "media-server-error",
          sid,
          data: {
            name: e.name,
            msg: e.message
          }
        });
      }
    },
    "end-stream": ({ streamId }) => {
      const stream = streamRooms[streamId];
      if (!stream) {
        logger.error(`send-track: Stream with id: ${streamId} was not found`);

        return;
      }

      const { state } = stream;

      if (!state) {
        logger.error("send-track: state is undefined");
        return;
      }

      if (streamId in streamRooms) {
        for (const peer of Object.values(state)) {
          closePeer(peer);
        }

        delete streamRooms[streamId];
      }
    },
    "resume-consumers": async ({ streamId, peerId }, sid, send) => {
      const stream = streamRooms[streamId];
      if (!stream) {
        logger.error(
          `resume-consumers: Stream with id: ${streamId} was not found`
        );

        return;
      }

      const { state } = stream;

      if (!state) {
        logger.error("resume-consumers: state is undefined");
        return;
      }

      const peer = state[peerId];

      if (!peer) {
        logger.error("resume-consumers: peer not found");
        return;
      }

      try {
        for (const consumer of peer.consumers) {
          await consumer.resume();
        }

        send({
          op: "resume-consumers-done",
          data: {
            streamId
          },
          sid
        });
      } catch (error) {
        const e = error as Error;
        send({
          op: "resume-consumers-done",
          sid,
          data: {
            error: e.message,
            streamId
          }
        });

        send({
          op: "media-server-error",
          sid,
          data: {
            name: e.name,
            msg: e.message
          }
        });
      }
    }
  });
}
