/* eslint-disable @typescript-eslint/no-unused-vars */
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
import amqp, { Channel, Connection } from "amqplib";
import prismaClient from "./config/prisma";
import { jwtDecode } from "jwt-decode";
import { initRabbitMQ } from "./utils/initRabbitMQ";

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
// eslint-disable-next-line prefer-const

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

let channel: Channel;

const connectRabbit = async () => {
  logger.info("Trying to connect to RabbitMQ...");

  let conn: Connection;

  try {
    conn = await amqp.connect(config.rabbitmq.url);
  } catch (err) {
    logger.error("Unable to connect to RabbitMQ: ", err);
    setTimeout(
      async () => await connectRabbit(),
      config.rabbitmq.retryInterval
    );
    return;
  }

  logger.info("Successfully connected to RabbitMQ");

  conn.on("close", async function (err: Error) {
    console.error("Rabbit connection closed with error: ", err);
    setTimeout(
      async () => await connectRabbit(),
      config.rabbitmq.retryInterval
    );
  });

  channel = await conn.createChannel();

  const sendQueue = config.rabbitmq.queues.media_server_queue;
  const recvQueue = config.rabbitmq.queues.api_server_queue;

  await Promise.all([
    channel.assertQueue(recvQueue),
    channel.assertQueue(sendQueue)
  ]);

  channel.purgeQueue(recvQueue);
};

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

(async () => {
  await connectRabbit();
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  await initRabbitMQ(channel, {
    "you-connected-as-streamer": (
      {
        streamId,
        routerRtpCapabilities,
        recvTransportOptions,
        sendTransportOptions
      },
      sid
    ) => {
      console.log("you-joined-as-streamer");
      io.to(sid).emit("you-joined-as-streamer", {
        streamId,
        routerRtpCapabilities,
        recvTransportOptions,
        sendTransportOptions
      });
    },
    "you-connected-as-viewer": (
      { streamId, routerRtpCapabilities, recvTransportOptions },
      sid
    ) => {
      io.to(sid).emit("you-joined-as-viewer", {
        streamId,
        routerRtpCapabilities,
        recvTransportOptions
      });
    },
    "media-server-error": (data) => {
      logger.warn(data);
      console.error(data);
    },
    "get-recv-tracks-res": ({ consumerParametersArr }, sid) => {
      io.to(sid).emit("get-recv-tracks-res", { consumerParametersArr });
    },
    "close-consumer": () => {},
    "you-left-stream": () => {},
    "send-track-recv-res": ({ id, error }, sid) => {
      io.to(sid).emit("send-track-recv-res", {
        id: id ?? "",
        error: error ?? ""
      });
    },
    "send-track-send-res": ({ id, error }, sid) => {
      console.log(error);
      io.to(sid).emit("send-track-send-res", {
        id: id ?? "",
        error: error ?? ""
      });
    },
    "connect-transport-recv-res": ({ error }, sid) => {
      io.to(sid).emit("connect-transport-recv-res", {
        error: error ?? ""
      });
    },
    "connect-transport-send-res": ({ error }, sid) => {
      console.log(error);
      io.to(sid).emit("connect-transport-send-res", {
        error: error ?? ""
      });
    }
  });
})();

io.on("connection", (socket) => {
  logger.info(`A new client with socket id: ${socket.id} connected`);

  socket.on("join_stream", async ({ streamId }, callback) => {
    const checkStream = await prismaClient.stream.findUnique({
      where: { id: streamId },
      select: {
        id: true,
        streamerId: true,
        created_at: true
      }
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

    if (!streams.get(streamId)) {
      // create stream
      streams.set(streamId, {
        id: checkStream.id,
        created_at: checkStream.created_at.toString(),
        streamer: socket.data.user,
        viewerCount: 0,
        viewers: []
      });

      logger.info(`Created stream: ${streamId}`);
    }

    const stream = streams.get(streamId)!;

    const checkIfAlreadyJoined = stream.viewers.find(
      (v) => v === socket.data.user.id
    );

    if (checkIfAlreadyJoined) {
      return callback({
        success: false,
        data: null,
        error: [
          {
            name: "Conflict",
            code: -1,
            msg: "You already joined the stream"
          }
        ]
      });
    }

    // is host ?
    if (stream.streamer.id === socket.data.user.id) {
      try {
        channel.sendToQueue(
          config.rabbitmq.queues.media_server_queue,
          Buffer.from(
            JSON.stringify({
              op: "connect-as-streamer",
              data: {
                streamId,
                peerId: socket.data.user.id
              },
              sid: socket.id
            })
          )
        );
      } catch (error) {
        logger.error("Error on connect_as_streamer");

        return callback({
          success: false,
          data: null,
          error: [
            {
              name: "Internal Server Error",
              code: -1,
              msg: "Their was an internal error, please try again"
            }
          ]
        });
      }
    } else {
      // is viewer

      try {
        channel.sendToQueue(
          config.rabbitmq.queues.media_server_queue,
          Buffer.from(
            JSON.stringify({
              op: "connect-as-viewer",
              data: {
                streamId,
                peerId: socket.data.user.id
              },
              sid: socket.id
            })
          )
        );
      } catch (error) {
        logger.error("Error on connect_as_viewer");

        return callback({
          success: false,
          data: null,
          error: [
            {
              name: "Internal Server Error",
              code: -1,
              msg: "Their was an internal error, please try again"
            }
          ]
        });
      }

      stream.viewerCount++;
      stream.viewers.push(socket.data.user.id);

      socket.to(streamId).emit("user_joined", {
        user: socket.data.user
      });

      socket
        .to(streamId)
        .emit("viewer_count", { viewerCount: stream.viewerCount });
    }

    socket.data.streamId = streamId;
    socket.join(streamId);

    logger.info(`User ${socket.data.user.username} joined stream: ${streamId}`);

    callback({
      success: true,
      data: null,
      error: []
    });
  });

  socket.on("connect-transport", ({ dtlsParameters, direction }) => {
    const { streamId, user } = socket.data;

    if (streamId && user) {
      try {
        channel.sendToQueue(
          config.rabbitmq.queues.media_server_queue,
          Buffer.from(
            JSON.stringify({
              op: "connect-transport",
              data: {
                streamId,
                peerId: user.id,
                dtlsParameters,
                direction
              },
              sid: socket.id
            })
          )
        );
      } catch (error) {
        logger.error("Error connect-transport");
      }
    }
  });

  socket.on("send-track", (data) => {
    const { streamId, user } = socket.data;

    if (streamId && user) {
      try {
        channel.sendToQueue(
          config.rabbitmq.queues.media_server_queue,
          Buffer.from(
            JSON.stringify({
              op: "send-track",
              data: {
                streamId,
                peerId: user.id,
                ...data
              },
              sid: socket.id
            })
          )
        );
      } catch (error) {
        logger.error("Error connect-transport");
      }
    }
  });

  socket.on("get-recv-tracks", ({ rtpCapabilities }) => {
    const { streamId, user } = socket.data;

    if (streamId && user) {
      try {
        channel.sendToQueue(
          config.rabbitmq.queues.media_server_queue,
          Buffer.from(
            JSON.stringify({
              op: "get-recv-tracks",
              data: {
                streamId,
                peerId: user.id,
                rtpCapabilities
              },
              sid: socket.id
            })
          )
        );
      } catch (error) {
        logger.error("Error connect-transport");
      }
    }
  });

  socket.on("leave_stream", async () => {
    const { streamId, user } = socket.data;

    if (!streamId || !user) {
      logger.warn("leave_stream: streamId or user is undefined");
      return;
    }

    const checkStream = await prismaClient.stream.findUnique({
      where: {
        id: streamId
      },
      select: {
        id: true,
        created_at: true,
        streamerId: true,
        streamer: {
          select: {
            id: true
          }
        }
      }
    });

    // stream found ??
    if (!checkStream) {
      logger.warn("leave_stream: stream not found");
      return;
    }

    const stream = streams.get(streamId);

    if (!stream) return;

    const checkIfPresent = stream.viewers.find(
      (v) => v === socket.data.user.id
    );

    if (!checkIfPresent) {
      logger.warn("leave_stream:  user is present in stream");
      return;
    }

    // is streamer stream host ?
    if (stream.streamer.id === user.id) {
      try {
        channel.sendToQueue(
          config.rabbitmq.queues.media_server_queue,
          Buffer.from(
            JSON.stringify({
              op: "end-stream",
              data: {
                streamId
              },
              sid: socket.id
            })
          )
        );
      } catch (error) {
        logger.error("Error on sending leave_stream message: ", error);
      }

      const ended_at = new Date();
      const duration =
        (ended_at.getTime() - checkStream.created_at.getTime()) / 1000;

      prismaClient.stream.update({
        where: { id: streamId },
        data: {
          ended_at,
          duration,
          active: false
        }
      });

      socket
        .to(streamId)
        .emit("stream_ended", { duration, ended_at: ended_at.toString() });

      socket.emit("you-left-stream");

      io.in(streamId).socketsLeave(streamId);

      streams.delete(streamId);
      delete socket.data.streamId;
    } else {
      try {
        channel.sendToQueue(
          config.rabbitmq.queues.media_server_queue,
          Buffer.from(
            JSON.stringify({
              op: "close-peer",
              data: {
                streamId,
                peerId: user.id
              },
              sid: socket.id
            })
          )
        );
      } catch (error) {
        logger.error("Error on sending leave_stream message: ", error);
      }

      socket.emit("you-left-stream");

      socket.leave(streamId);

      stream.viewerCount--;
      stream.viewers = stream.viewers.filter(
        (id) => id !== socket.data.user.id
      );
      delete socket.data.streamId;

      logger.info(
        `User ${socket.data.user.username} leaved stream: ${streamId}`
      );

      socket.to(streamId).emit("user_leaved", {
        user: socket.data.user
      });

      socket
        .to(streamId)
        .emit("viewer_count", { viewerCount: stream.viewerCount });
    }
  });

  socket.on("send_msg", ({ msg }) => {
    console.log(msg);
  });

  socket.on("send_reward", ({ msg, reward }) => {
    console.log(msg, reward);
  });

  socket.on("disconnecting", async () => {
    logger.info(`${socket.id} is in disconnecting state`);

    const { streamId, user } = socket.data;

    // check if socket is in stream ?
    if (!streamId || !user) {
      return;
    }

    const checkStream = await prismaClient.stream.findUnique({
      where: {
        id: streamId
      },
      select: {
        id: true,
        created_at: true,
        streamerId: true,
        streamer: {
          select: {
            id: true
          }
        }
      }
    });

    // stream found ??
    if (!checkStream) {
      logger.warn("leave_stream: stream not found");
      return;
    }

    const stream = streams.get(streamId);

    if (!stream) return;

    const checkIfPresent = stream.viewers.find(
      (v) => v === socket.data.user.id
    );

    if (!checkIfPresent) {
      logger.warn("leave_stream:  user is present in stream");
      return;
    }

    // is streamer stream host ?
    if (stream.streamer.id === user.id) {
      try {
        channel.sendToQueue(
          config.rabbitmq.queues.media_server_queue,
          Buffer.from(
            JSON.stringify({
              op: "end-stream",
              data: {
                streamId
              },
              sid: socket.id
            })
          )
        );
      } catch (error) {
        logger.error("Error on sending leave_stream message: ", error);
      }

      const ended_at = new Date();
      const duration =
        (ended_at.getTime() - checkStream.created_at.getTime()) / 1000;

      prismaClient.stream.update({
        where: { id: streamId },
        data: {
          ended_at,
          duration,
          active: false
        }
      });

      socket
        .to(streamId)
        .emit("stream_ended", { duration, ended_at: ended_at.toString() });

      io.in(streamId).socketsLeave(streamId);

      streams.delete(streamId);
      delete socket.data.streamId;
    } else {
      try {
        channel.sendToQueue(
          config.rabbitmq.queues.media_server_queue,
          Buffer.from(
            JSON.stringify({
              op: "close-peer",
              data: {
                streamId,
                peerId: user.id
              },
              sid: socket.id
            })
          )
        );
      } catch (error) {
        logger.error("Error on sending leave_stream message: ", error);
      }

      socket.leave(streamId);

      stream.viewerCount--;
      stream.viewers = stream.viewers.filter(
        (id) => id !== socket.data.user.id
      );
      delete socket.data.streamId;

      logger.info(
        `User ${socket.data.user.username} leaved stream: ${streamId}`
      );

      socket.to(streamId).emit("user_leaved", {
        user: socket.data.user
      });

      socket
        .to(streamId)
        .emit("viewer_count", { viewerCount: stream.viewerCount });
    }
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
