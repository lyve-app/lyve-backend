import { Worker } from "mediasoup/node/lib/Worker";
import { sendToQueue } from "./sendToQueue";
import logger from "../middleware/logger";
import {
  ConnectConsumerTransportMessage,
  ConnectProducerTransportMessage,
  CreateConsumerMessage,
  CreateProducerMessage,
  CreateStreamMessage,
  EndStreamMessage,
  LeaveStreamMessage
} from "../types/rabbitmq";
import { Router } from "mediasoup/node/lib/Router";
import { StreamRoom } from "../types/streamroom";
import config from "../config/config";
import { Channel } from "amqplib";
import { createWebRtcTransport } from "./createWebRtcTransport";

export async function createStream(
  data: CreateStreamMessage,
  worker: Worker,
  router: Router,
  streamRooms: StreamRoom
): Promise<void> {
  const { streamId } = data;
  if (streamRooms[streamId]) {
    logger.error(`Stream with ID ${streamId} already exists`);
    return;
  }

  streamRooms[streamId] = {
    worker,
    router,
    state: {}
  };
  logger.info(`Created stream with ID: ${streamId}`);
}

export async function createProducer(
  data: CreateProducerMessage,
  channel: Channel,
  streamRooms: StreamRoom
): Promise<void> {
  const { streamId, clientId, rtpCapabilities } = data;
  try {
    const stream = streamRooms[streamId];
    if (!stream) {
      throw new Error("Stream not found");
    }
    const { router, state } = stream;
    if (!router.canConsume({ producerId: clientId, rtpCapabilities })) {
      throw new Error("Client cannot consume");
    }
    const transport = await createWebRtcTransport(router);
    state[clientId] = {
      sendTransport: transport,
      recvTransport: null,
      producer: null,
      consumers: []
    };
    sendToQueue(channel, config.rabbitmq.queues.api_server_queue, {
      type: "createProducerResponse",
      clientId,
      transportParams: {
        id: transport.id,
        iceParameters: transport.iceParameters,
        iceCandidates: transport.iceCandidates,
        dtlsParameters: transport.dtlsParameters
      }
    });
    logger.info("Producer created for client:", clientId);
  } catch (error) {
    logger.error("Error creating producer:", error);
  }
}

export async function connectProducerTransport(
  data: ConnectProducerTransportMessage,
  channel: Channel,
  streamRooms: StreamRoom
): Promise<void> {
  const { dtlsParameters, clientId, streamId, rtpParameters } = data;
  try {
    const stream = streamRooms[streamId];

    if (!stream) {
      throw new Error("Stream not found");
    }

    const client = stream?.state[clientId];

    if (!client || !client.sendTransport) {
      throw new Error("Client not found");
    }
    const { sendTransport } = client;

    await sendTransport.connect({ dtlsParameters });
    const producer = await sendTransport.produce({
      kind: "video",
      rtpParameters
    });
    client.producer = producer;
    sendToQueue(channel, config.rabbitmq.queues.api_server_queue, {
      type: "producerReady",
      clientId
    });
    logger.info("Producer transport connected for client:", clientId);
  } catch (error) {
    logger.error("Error connecting producer transport:", error);
  }
}

export async function createConsumer(
  data: CreateConsumerMessage,
  channel: Channel,
  streamRooms: StreamRoom
): Promise<void> {
  const { rtpCapabilities, clientId, streamId } = data;
  try {
    const stream = streamRooms[streamId];

    if (!stream) {
      throw new Error("Stream not found");
    }

    const { router } = stream;

    const client = stream?.state[clientId];

    if (!client) {
      throw new Error("Client not found");
    }

    if (
      !router.canConsume({
        producerId: client.producer!.id,
        rtpCapabilities
      })
    ) {
      throw new Error("Client cannot consume");
    }
    const transport = await createWebRtcTransport(router);
    client.recvTransport = transport;
    sendToQueue(channel, config.rabbitmq.queues.api_server_queue, {
      type: "createConsumerResponse",
      clientId,
      transportParams: {
        id: transport.id,
        iceParameters: transport.iceParameters,
        iceCandidates: transport.iceCandidates,
        dtlsParameters: transport.dtlsParameters
      }
    });
    logger.info("Consumer created for client:", clientId);
  } catch (error) {
    logger.error("Error creating consumer:", error);
  }
}

export async function connectConsumerTransport(
  data: ConnectConsumerTransportMessage,
  channel: Channel,
  streamRooms: StreamRoom
): Promise<void> {
  const { dtlsParameters, clientId, streamId, rtpCapabilities } = data;
  try {
    const stream = streamRooms[streamId];

    if (!stream) {
      throw new Error("Stream not found");
    }

    const client = stream?.state[clientId];

    if (!client || !client.recvTransport || !client.producer) {
      throw new Error("Client not found");
    }

    const { recvTransport, producer } = client;

    await recvTransport.connect({ dtlsParameters });
    const consumer = await recvTransport.consume({
      producerId: producer!.id,
      rtpCapabilities,
      paused: false
    });
    client.consumers.push(consumer);
    sendToQueue(channel, config.rabbitmq.queues.api_server_queue, {
      type: "consumerReady",
      clientId,
      consumerParams: {
        id: consumer.id,
        producerId: consumer.producerId,
        kind: consumer.kind,
        rtpParameters: consumer.rtpParameters
      }
    });
    logger.info("Consumer transport connected for client:", clientId);
  } catch (error) {
    logger.error("Error connecting consumer transport:", error);
  }
}

export async function endStream(
  data: EndStreamMessage,
  streamRooms: StreamRoom
): Promise<void> {
  const { streamId } = data;
  const stream = streamRooms[streamId];
  if (stream) {
    for (const clientId in stream.state) {
      const peer = stream.state[clientId];

      if (peer) {
        if (peer.producer) peer.producer.close();
        if (peer.sendTransport) peer.sendTransport.close();
        if (peer.recvTransport) peer.recvTransport.close();
        for (const consumer of peer.consumers) {
          consumer.close();
        }
      }
    }
    delete streamRooms[streamId];
    logger.info(`Stream ended with ID: ${streamId}`);
  }
}

export async function leaveStream(
  data: LeaveStreamMessage,
  streamRooms: StreamRoom
): Promise<void> {
  const { clientId, streamId } = data;
  const stream = streamRooms[streamId];
  if (stream) {
    const peer = stream.state[clientId];
    if (peer) {
      if (peer.producer) peer.producer.close();
      if (peer.sendTransport) peer.sendTransport.close();
      if (peer.recvTransport) peer.recvTransport.close();
      for (const consumer of peer.consumers) {
        consumer.close();
      }
      delete stream.state[clientId];
    }
    logger.info(`Client left stream: ${streamId}`);
  }
}
