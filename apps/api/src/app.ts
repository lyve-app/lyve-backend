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
import { searchRouter, streamRouter, userRouter } from "./routes";
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
import { rewards } from "./utils/rewards";
import { getNotificationsMessage } from "./utils/notificationsMessages";
import isAuth from "./middleware/isAuth";
import { handleAchievements } from "./service/achievments.service";

type Stream = {
  id: string;
  created_at: string;
  streamer: SocketUser;
  viewerCount: number;
  viewers: Array<string>; // viewers that are currently in the livestream
  mostViewers: number;
};

// Holds state of active streams
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const streams: Map<string, Stream> = new Map(); // key is the id of the stream
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

app.use("/api/user", isAuth, userRouter);

app.use("/api/stream", isAuth, streamRouter);

app.use("/api/search", isAuth, searchRouter);

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
      io.to(sid).emit("connect-transport-send-res", {
        error: error ?? ""
      });
    },
    "resume-consumers-done": ({ error }, sid) => {
      io.to(sid).emit("resume-consumers-done", {
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
        created_at: true,
        ended_at: true
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

    if (checkStream.ended_at) {
      return callback({
        success: false,
        data: null,
        error: [
          {
            name: "Stream Ended",
            code: -1,
            msg: "This stream has already ended."
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
        viewers: [],
        mostViewers: 0
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

      if (stream.viewerCount > stream.mostViewers) {
        stream.mostViewers = stream.viewerCount;
      }

      await prismaClient.stream.update({
        where: {
          id: streamId
        },
        data: {
          viewerCount: {
            increment: 1
          }
        }
      });

      io.to(streamId).emit("user_joined", {
        user: socket.data.user
      });

      io.to(streamId).emit("viewer_count", { viewerCount: stream.viewerCount });
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

  socket.on("resume-consumers", () => {
    const { streamId, user } = socket.data;

    if (streamId && user) {
      try {
        channel.sendToQueue(
          config.rabbitmq.queues.media_server_queue,
          Buffer.from(
            JSON.stringify({
              op: "resume-consumers",
              data: {
                streamId,
                peerId: user.id
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
        active: true,
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

    // is streamer stream host ?
    if (checkStream.streamerId === user.id) {
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

      // has stream started ??
      if (!checkStream.active) {
        // if host left before he started the stream we delete the stream
        await prismaClient.stream.delete({
          where: {
            id: checkStream.id
          }
        });
      } else {
        const ended_at = new Date();
        const duration =
          (ended_at.getTime() - checkStream.created_at.getTime()) / 1000;

        // update stream
        await prismaClient.stream.update({
          where: { id: streamId },
          data: {
            ended_at,
            duration,
            active: false,
            mostViewers: stream.mostViewers
          }
        });

        // update user stats
        await prismaClient.user.update({
          where: { id: checkStream.streamerId },
          data: {
            numStreams: {
              increment: 1
            },
            minStreamed: { increment: Math.round(duration / 60) },
            num10minStreams: { increment: duration / 60 > 10 ? 1 : 0 }
          }
        });

        await handleAchievements(checkStream.streamerId);

        // broadcast stream end to all clients
        io.to(streamId).emit("stream_ended", {
          duration,
          ended_at: ended_at.toString()
        });
      }

      socket.emit("you-left-stream");

      io.in(streamId).socketsLeave(streamId);

      streams.delete(streamId);
      delete socket.data.streamId;
    } else {
      const checkIfPresent = stream.viewers.find(
        (v) => v === socket.data.user.id
      );

      if (!checkIfPresent) {
        logger.warn("leave_stream: user is not present in stream");
        return;
      }

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

      stream.viewerCount--;
      stream.viewers = stream.viewers.filter((id) => id !== user.id);

      socket.emit("you-left-stream");

      await prismaClient.stream.update({
        where: {
          id: streamId
        },
        data: {
          viewerCount: {
            decrement: 1
          }
        }
      });

      socket.to(streamId).emit("user_leaved", {
        user: socket.data.user
      });

      socket
        .to(streamId)
        .emit("viewer_count", { viewerCount: stream.viewerCount });

      socket.leave(streamId);

      delete socket.data.streamId;

      logger.info(
        `User ${socket.data.user.username} leaved stream: ${streamId}`
      );
    }
  });

  socket.on("send_msg", ({ msg, gif }) => {
    const { streamId, user } = socket.data;
    if (streamId && user) {
      io.to(streamId).emit("new_msg", {
        id: crypto.randomUUID(),
        ...(msg && { msg }),
        ...(gif && { gif }),
        sender: user,
        created_at: Date.now().toString()
      });
    }
  });

  socket.on("send_reward", async ({ msg, reward }, cb) => {
    const { streamId, user } = socket.data;

    // check if socket is in stream ?
    if (!streamId) {
      return cb({
        success: false,
        data: null,
        error: [
          {
            name: "Stream not found",
            code: -1,
            msg: "The stream was not found"
          }
        ]
      });
    }

    if (!user) {
      return cb({
        success: false,
        data: null,
        error: [
          {
            name: "User metadata",
            code: -1,
            msg: "Socket has no user metadata"
          }
        ]
      });
    }

    const stream = streams.get(streamId);

    if (!stream) {
      return cb({
        success: false,
        data: null,
        error: [
          {
            name: "Stream not found",
            code: -1,
            msg: "The stream was not found"
          }
        ]
      });
    }

    if (user.id === stream.streamer.id) {
      return cb({
        success: false,
        data: null,
        error: [
          {
            name: "Forbidden",
            code: -1,
            msg: "You cannot send a reward to yourself"
          }
        ]
      });
    }

    // check if reward type is valid and get points
    const redwardInfo = rewards[reward.type];

    // check if user can afford this reward
    const sender = await prismaClient.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        coins: true
      }
    });

    if (!sender) {
      return cb({
        success: false,
        data: null,
        error: [
          {
            name: "User not Found",
            code: -1,
            msg: `Cannot find user with id: ${user.id}`
          }
        ]
      });
    }

    if (sender.coins < redwardInfo.cost) {
      return cb({
        success: false,
        data: null,
        error: [
          {
            name: "Not enough coins",
            code: -1,
            msg: "You cannot afford this reward"
          }
        ]
      });
    }

    // save in database
    const newDBReward = await prismaClient.rewards.create({
      data: {
        type: reward.type,
        points: redwardInfo.points,
        receiverId: stream.streamer.id,
        senderId: user.id
      }
    });

    // create notification
    await prismaClient.notification.create({
      data: {
        type: "REWARD_RECEIVED",
        rewardId: newDBReward.id,
        message: getNotificationsMessage("REWARD_RECEIVED", user.dispname),
        userWhoFiredEvent: user.id,
        recipientId: stream.streamer.id
      }
    });

    // update user promotion points
    await prismaClient.user.update({
      where: { id: stream.streamer.id },
      data: {
        promotionPoints: {
          increment: redwardInfo.points
        }
      }
    });

    // decrease sender coins
    await prismaClient.user.update({
      where: { id: user.id },
      data: {
        coins: {
          decrement: redwardInfo.cost
        }
      }
    });

    // broadcast to all
    io.to(streamId).emit("resv_reward", {
      msg,
      reward: {
        id: newDBReward.id,
        type: reward.type,
        points: redwardInfo.points
      },
      receiver: stream.streamer,
      sender: user
    });

    // successful cb
    cb({
      success: true,
      data: null,
      error: []
    });
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
        active: true,
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

    // is streamer stream host ?
    if (checkStream.streamerId === user.id) {
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

      // has stream started ??
      if (!checkStream.active) {
        // if host left before he started the stream we delete the stream
        await prismaClient.stream.delete({
          where: {
            id: checkStream.id
          }
        });
      } else {
        const ended_at = new Date();
        const duration =
          (ended_at.getTime() - checkStream.created_at.getTime()) / 1000;

        // update stream
        await prismaClient.stream.update({
          where: { id: streamId },
          data: {
            ended_at,
            duration,
            mostViewers: stream.mostViewers,
            active: false
          }
        });

        // update user stats
        await prismaClient.user.update({
          where: { id: checkStream.streamerId },
          data: {
            numStreams: {
              increment: 1
            },
            minStreamed: { increment: Math.round(duration / 60) },
            num10minStreams: { increment: duration / 60 > 10 ? 1 : 0 }
          }
        });

        await handleAchievements(checkStream.streamerId);

        // broadcast stream end to all clients
        io.to(streamId).emit("stream_ended", {
          duration,
          ended_at: ended_at.toString()
        });
      }

      io.in(streamId).socketsLeave(streamId);

      streams.delete(streamId);
      delete socket.data.streamId;
    } else {
      const checkIfPresent = stream.viewers.find((v) => v === user.id);

      if (!checkIfPresent) {
        logger.warn("leave_stream: user is not present in stream");
        return;
      }

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

      await prismaClient.stream.update({
        where: {
          id: streamId
        },
        data: {
          viewerCount: {
            decrement: 1
          }
        }
      });

      delete socket.data.streamId;

      logger.info(
        `User ${socket.data.user.username} leaved stream: ${streamId}`
      );

      socket.to(streamId).emit("user_leaved", {
        user: socket.data.user
      });

      io.to(streamId).emit("viewer_count", { viewerCount: stream.viewerCount });
    }
  });

  socket.on("disconnect", (reason) => {
    logger.info(
      `Client with socket id: ${socket.id} disconnected reason: ${reason}`
    );
  });
});

app.all("*", (_req, res) => {
  res.status(404).json({ error: "404 Not Found" });
});

app.use(errorHandler);

export default server;
