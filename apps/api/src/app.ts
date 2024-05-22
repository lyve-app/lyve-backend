import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import compressFilter from "./utils/compressFilter.util";
import { errorHandler } from "./middleware/errorHandler";
import config from "./config/config";
import { xssMiddleware } from "./middleware/xssMiddleware";
import { createServer } from "http";
import { streamRouter, userRouter } from "./routes";
import { Server } from "socket.io";
import logger from "./middleware/logger";
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
  SocketUser
} from "./types/socket";
import { Channel } from "amqplib";
import { initRabbitMQ } from "./utils/initRabbitMQ";
import { IncomingEventTypes } from "./types/rabbitmq";
import prismaClient from "./config/prisma";
import { jwtDecode } from "jwt-decode";

type Stream = {
  id: string;
  created_at: string;
  streamer: SocketUser;
  viewerCount: number;
  viewers: Array<string>;
};

// Holds state of active streams
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const streams: Map<string, Stream> = new Map(); // key is the id of the stream

// eslint-disable-next-line @typescript-eslint/no-unused-vars
let channel: Channel;

const app: Express = express();
const server = createServer(app);
const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>(server, {
  path: "/socket/",
  cors: {
    origin: String(config.cors.origin).split("|") ?? "*",
    allowedHeaders: ["GET", "POST"]
  },
  connectionStateRecovery: {
    // default values
    maxDisconnectionDuration: 2 * 60 * 1000,
    skipMiddlewares: false
  }
});

// Helmet is used to secure this app by configuring the http-header
app.use(helmet());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

app.use(xssMiddleware());

app.use(cookieParser());

// Compression is used to reduce the size of the response body
app.use(compression({ filter: compressFilter }));

app.use(
  cors({
    // origin is given a array if we want to have multiple origins later
    origin: String(config.cors.origin).split("|") ?? "*",
    credentials: true
  })
);

app.get("/", (_req, res) => {
  res.status(200).json({ msg: "Up" });
});

app.use("/api/user", userRouter);

app.use("/api/stream", streamRouter);

async () => {
  await initRabbitMQ(config.rabbitmq.url, channel, (data) => {
    switch (data.type) {
      case IncomingEventTypes.CREATE_PRODUCER_RESPONSE:
        io.to(data.clientId).emit("create_producer_response", {
          transportParams: data.transportParams
        });
        break;
      case IncomingEventTypes.PRODUCER_READY:
        io.to(data.clientId).emit("producer_ready");
        break;
      case IncomingEventTypes.CREATE_CONSUMER_RESPONSE:
        io.to(data.clientId).emit("create_consumer_response", {
          transportParams: data.transportParams
        });
        break;
      case IncomingEventTypes.CONSUMER_READY:
        io.to(data.clientId).emit("consumer_ready", {
          consumerParams: data.consumerParams
        });
        break;
      default:
        logger.error("Unknown message type:", data);
    }
  });
};

io.use(async (socket, next) => {
  const { token } = socket.handshake.auth;

  const decodedToken = jwtDecode(token);

  if (!decodedToken?.sub) {
    return next(new Error("token.sub is undefined"));
  }
  const user = await prismaClient.user.findUnique({
    where: { id: decodedToken.sub },
    select: {
      id: true,
      username: true,
      dispname: true,
      avatar_url: true
    }
  });

  if (!user) {
    return next(new Error("user not found"));
  }

  socket.data.user = user;

  next();
});

io.on("connection", (socket) => {
  logger.info(`A new client with socket id: ${socket.id} connected`);

  // socket.on("connect_as_streamer", async (streamId, userId) => {});

  /**
   * Listens to get_router_rtp_capabilities and will send a message via rabbitmq to request rtp capabilities from the mediaserver
   */
  // socket.on("get_router_rtp_capabilities", async ({ streamId }, callback) => {
  //   const correlationId = crypto.randomUUID();

  //   channel.consume(
  //     config.rabbitmq.queues.api_server_reply_queue,
  //     (msg) => {
  //       if (msg && msg.properties.correlationId === correlationId) {
  //         const data: RabbitMQIncomingMessage = JSON.parse(
  //           msg.content.toString()
  //         );
  //         if (
  //           data.type === IncomingEventTypes.GET_RTP_CAPABILITIES_RESPONSE &&
  //           data.clientId === socket.data.user.id
  //         ) {
  //           callback({
  //             success: true,
  //             data: data.rtpCapabilities,
  //             error: []
  //           });
  //         }
  //       }
  //     },
  //     { noAck: true }
  //   );

  //   try {
  //     channel.sendToQueue(
  //       config.rabbitmq.queues.media_server_queue,
  //       Buffer.from(
  //         JSON.stringify({
  //           type: OutgoingEventType.GET_ROUTER_RTP_CAPABILITIES,
  //           streamId,
  //           clientId: socket.data.user.id
  //         })
  //       ),
  //       {
  //         replyTo: config.rabbitmq.queues.api_server_reply_queue,
  //         correlationId
  //       }
  //     );
  //   } catch (err) {
  //     logger.error(
  //       `Error by sending ${OutgoingEventType.GET_ROUTER_RTP_CAPABILITIES}: `,
  //       err
  //     );
  //     if (err instanceof Error) {
  //       callback({
  //         success: false,
  //         data: null,
  //         error: [
  //           {
  //             name: err.name,
  //             code: -1,
  //             msg: err.message
  //           }
  //         ]
  //       });
  //     }
  //   }
  // });

  /**
   * Creates a stream
   */
  socket.on("create_stream", async ({ streamId }, callback) => {
    console.log(streams);
    const stream = streams.get(streamId);

    logger.info("create_stream called");

    if (stream) {
      return callback({
        success: false,
        data: { streamId },
        error: [
          {
            name: "Conflict",
            code: -1,
            msg: "Stream exists already"
          }
        ]
      });
    }

    const checkStream = await prismaClient.stream.findUnique({
      where: { id: streamId }
    });

    if (!checkStream) {
      return callback({
        success: false,
        data: null,
        error: [
          {
            name: "Not Found",
            code: -1,
            msg: "Stream not found"
          }
        ]
      });
    }

    console.log(checkStream);

    // check if socket is host of the stream
    if (checkStream.streamerId !== socket.data.user.id) {
      // no he is not
      return callback({
        success: false,
        data: null,
        error: [
          {
            name: "Forbidden",
            code: 403,
            msg: "You are not the host of this stream"
          }
        ]
      });
    }

    streams.set(streamId, {
      id: streamId,
      created_at: Date.now().toString(),
      streamer: socket.data.user,
      viewerCount: 0,
      viewers: []
    });

    socket.join(streamId);
    socket.data.streamId = streamId;

    callback({
      success: true,
      data: { streamId },
      error: []
    });
  });

  // socket.on("join_stream", async ({ streamId }) => {
  //   const stream = streams.get(streamId);

  //   if (!stream) return;

  //   const checkIfAlreadyJoined = stream.viewers.find(
  //     (v) => v === socket.data.user.id
  //   );

  //   if (checkIfAlreadyJoined || stream.streamer.id === socket.data.user.id) {
  //     return;
  //   }

  //   socket.join(streamId);

  //   logger.info(`User ${socket.data.user.username} joined stream: ${streamId}`);

  //   stream.viewerCount++;
  //   stream.viewers.push(socket.data.user.id);
  //   socket.data.streamId = streamId;

  //   socket.to(streamId).emit("user_joined", {
  //     user: socket.data.user
  //   });

  //   socket
  //     .to(streamId)
  //     .emit("viewer_count", { viewerCount: stream.viewerCount });
  // });

  // socket.on("leave_stream", () => {
  //   const { streamId } = socket.data;

  //   if (!streamId) return;

  //   const stream = streams.get(streamId);

  //   if (!stream) return;

  //   const checkIfPresent = stream.viewers.find(
  //     (v) => v === socket.data.user.id
  //   );

  //   if (!checkIfPresent) {
  //     return;
  //   }

  //   try {
  //     channel.sendToQueue(
  //       config.rabbitmq.queues.media_server_queue,
  //       Buffer.from(
  //         JSON.stringify({
  //           type: OutgoingEventType.LEAVE_STREAM,
  //           clientId: socket.data.user.id,
  //           streamId
  //         })
  //       )
  //     );
  //   } catch (error) {
  //     logger.error("Error on sending leave_stream message: ", error);
  //   }

  //   socket.leave(streamId);

  //   stream.viewerCount--;
  //   stream.viewers = stream.viewers.filter((id) => id !== socket.data.user.id);

  //   logger.info(`User ${socket.data.user.username} leaved stream: ${streamId}`);

  //   socket.to(streamId).emit("user_leaved", {
  //     user: socket.data.user
  //   });

  //   socket
  //     .to(streamId)
  //     .emit("viewer_count", { viewerCount: stream.viewerCount });
  // });

  // socket.on("start_stream", async ({ streamId }, cb) => {
  //   const checkStream = await prismaClient.stream.findUnique({
  //     where: {
  //       id: streamId
  //     },
  //     select: {
  //       streamerId: true,
  //       streamer: {
  //         select: {
  //           id: true
  //         }
  //       }
  //     }
  //   });

  //   if (!checkStream) {
  //     return cb({
  //       success: false,
  //       data: null,
  //       error: [
  //         {
  //           name: "Not Found",
  //           code: -1,
  //           msg: `No stream with id: ${streamId} found`
  //         }
  //       ]
  //     });
  //   }

  //   if (checkStream?.streamerId !== socket.data.user.id) {
  //     return cb({
  //       success: false,
  //       data: null,
  //       error: [
  //         {
  //           name: "Forbidden",
  //           code: -1,
  //           msg: "You are not the host of this stream"
  //         }
  //       ]
  //     });
  //   }

  //   await prismaClient.stream.update({
  //     where: { id: streamId },
  //     data: { active: true }
  //   });

  //   cb({
  //     success: true,
  //     data: null,
  //     error: []
  //   });

  //   socket.to(streamId).emit("viewer_count", {
  //     viewerCount: streams.get(streamId)?.viewerCount || 0
  //   });
  // });

  // socket.on("create_producer", ({ rtpCapabilities }) => {
  //   const { streamId } = socket.data;
  //   // check if socket is in stream
  //   if (!streamId) {
  //     return;
  //   }

  //   if (!streams.get(streamId)) {
  //     return;
  //   }

  //   try {
  //     channel.sendToQueue(
  //       config.rabbitmq.queues.media_server_queue,
  //       Buffer.from(
  //         JSON.stringify({
  //           type: OutgoingEventType.CREATE_PRODUCER,
  //           streamId: streamId,
  //           clientId: socket.data.user.id,
  //           rtpCapabilities
  //         })
  //       )
  //     );
  //     logger.info(
  //       `Client ${socket.data.user.id} requested to create a producer`
  //     );
  //   } catch (err) {
  //     logger.error("Error on create_producer: ", err);
  //   }
  // });

  // socket.on(
  //   "connect_producer_transport",
  //   ({ dtlsParameters, rtpParameters }) => {
  //     const { streamId } = socket.data;
  //     // check if socket is in stream
  //     if (!streamId) {
  //       return;
  //     }

  //     if (!streams.get(streamId)) {
  //       return;
  //     }

  //     try {
  //       channel.sendToQueue(
  //         config.rabbitmq.queues.media_server_queue,
  //         Buffer.from(
  //           JSON.stringify({
  //             type: OutgoingEventType.CONNECT_PRODUCER_TRANSPORT,
  //             streamId: streamId,
  //             clientId: socket.data.user.id,
  //             rtpParameters,
  //             dtlsParameters
  //           })
  //         )
  //       );
  //       logger.info(
  //         `Client ${socket.data.user.id} requested to connect producer transport`
  //       );
  //     } catch (err) {
  //       logger.error("Error on connect_producer_transport: ", err);
  //     }
  //   }
  // );

  // socket.on("end_stream", async () => {
  //   const { streamId } = socket.data;

  //   if (!streamId) {
  //     return;
  //   }

  //   const checkStream = await prismaClient.stream.findUnique({
  //     where: {
  //       id: streamId
  //     },
  //     select: {
  //       id: true,
  //       created_at: true,
  //       streamerId: true,
  //       streamer: {
  //         select: {
  //           id: true
  //         }
  //       }
  //     }
  //   });

  //   // stream found ??
  //   if (!checkStream) {
  //     return;
  //   }

  //   // is host ??
  //   if (checkStream.streamerId !== socket.data.user.id) {
  //     return;
  //   }

  //   const ended_at = new Date();
  //   const duration =
  //     (ended_at.getTime() - checkStream.created_at.getTime()) / 1000;

  //   prismaClient.stream.update({
  //     where: { id: streamId },
  //     data: {
  //       ended_at,
  //       duration,
  //       active: false
  //     }
  //   });

  //   socket.emit("stream_ended", { duration, ended_at: ended_at.toString() });

  //   io.in(streamId).socketsLeave(streamId);

  //   try {
  //     channel.sendToQueue(
  //       config.rabbitmq.queues.media_server_queue,
  //       Buffer.from(
  //         JSON.stringify({
  //           type: OutgoingEventType.END_STREAM,
  //           streamId: checkStream.id
  //         })
  //       )
  //     );
  //   } catch (error) {
  //     logger.error("Error on end_stream: ", error);
  //   }

  //   streams.delete(streamId);
  //   delete socket.data.streamId;
  // });

  socket.on("send_msg", ({ msg }) => {
    console.log(msg);
  });

  socket.on("send_reward", ({ msg, reward }) => {
    console.log(msg, reward);
  });

  socket.on("disconnecting", () => {
    logger.info(`${socket.id} is in disconnecting state`);
  });

  socket.on("disconnect", () => {
    logger.info(`Client with socket id: ${socket.id} disconnected`);
  });
});

app.all("*", (_req, res) => {
  res.status(404).json({ error: "404 Not Found" });
});

app.use(errorHandler);

export default server;
