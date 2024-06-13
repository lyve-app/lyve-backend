import type { Request, Response } from "express";
import httpStatus from "http-status";
import prismaClient from "../config/prisma";
import { Prisma, Stream, User } from "@prisma/client";
import { TypedRequest, TypedResponse } from "../types/types";
import { createErrorObject } from "../utils/createErrorObject";
import { getNotificationsMessage } from "../utils/notificationsMessages";
import { uploadFileToBlob } from "../service/blob.service";
import path from "path";

export const getStreamInfo = async (
  req: Request<{ id: string }>,
  res: Response<
    TypedResponse<{
      stream: Stream & {
        streamer: Pick<
          User,
          | "id"
          | "username"
          | "dispname"
          | "avatar_url"
          | "followerCount"
          | "promotionPoints"
          | "level"
        > & {
          followed: boolean;
        };
      };
    }>
  >
) => {
  const { user } = req;
  const { id } = req.params;

  if (!user) {
    return res.status(httpStatus.FORBIDDEN).json({
      success: false,
      data: null,
      error: [
        ...createErrorObject(
          httpStatus.FORBIDDEN,
          "Access denied. Invalid token"
        )
      ]
    });
  }

  const stream = await prismaClient.stream.findFirst({
    where: { id },
    include: {
      streamer: {
        select: {
          id: true,
          username: true,
          avatar_url: true,
          dispname: true,
          followerCount: true,
          promotionPoints: true,
          level: true
        }
      }
    }
  });

  if (!stream) {
    return res.status(httpStatus.NOT_FOUND).json({
      success: false,
      data: null,
      error: [...createErrorObject(httpStatus.NOT_FOUND, "Stream not found")]
    });
  }

  let followed = false;

  if (user.id !== stream.streamerId) {
    // find follow record of user and streamer
    const followsStreamer = prismaClient.follows.findUnique({
      where: {
        followingId_followedById: {
          followedById: user.id,
          followingId: stream.streamerId
        }
      }
    });

    followed = !!followsStreamer;
  }
  return res.status(httpStatus.OK).json({
    success: true,
    data: {
      stream: {
        ...stream,
        streamer: {
          ...stream.streamer,
          followed
        }
      }
    },
    error: []
  });
};

export const createStream = async (
  req: TypedRequest<{ genre: string }>,
  res: Response<
    TypedResponse<{
      stream: Stream & {
        streamer: Pick<
          User,
          | "id"
          | "username"
          | "dispname"
          | "avatar_url"
          | "followerCount"
          | "promotionPoints"
          | "level"
        >;
      };
    }>
  >
) => {
  const { user } = req;
  const { genre } = req.body;

  if (!user || !genre) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      data: null,
      error: [
        ...createErrorObject(httpStatus.BAD_REQUEST, " genre must be defined")
      ]
    });
  }

  const checkForActiveStreams = await prismaClient.stream.findFirst({
    where: {
      AND: [{ streamerId: { equals: user.id } }, { active: { equals: true } }]
    },
    select: { streamerId: true }
  });

  if (checkForActiveStreams) {
    return res.status(httpStatus.CONFLICT).json({
      success: false,
      data: null,
      error: [
        ...createErrorObject(
          httpStatus.CONFLICT,
          "You are already host of an has an active stream"
        )
      ]
    });
  }

  let previewImgUrl = "";

  if (req.file) {
    try {
      const buffer = req.file.buffer;
      const fileExtension = path.extname(req.file.originalname);
      const blobName = `${crypto.randomUUID()}${fileExtension}`;

      const uploadedImage = await uploadFileToBlob(buffer, blobName);
      previewImgUrl = uploadedImage.url;
    } catch (error) {
      console.log(error);
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        data: null,
        error: [
          ...createErrorObject(
            httpStatus.INTERNAL_SERVER_ERROR,
            "Error uploading file."
          )
        ]
      });
    }
  }

  const stream = await prismaClient.stream.create({
    data: {
      streamerId: user.id,
      previewImgUrl: previewImgUrl,
      genre: genre
    },
    include: {
      streamer: {
        select: {
          id: true,
          username: true,
          dispname: true,
          promotionPoints: true,
          level: true,
          avatar_url: true,
          followerCount: true
        }
      }
    }
  });

  return res.status(httpStatus.CREATED).json({
    success: true,
    data: {
      stream
    },
    error: []
  });
};

export const startStream = async (
  req: Request<{ id: string }>,
  res: Response<
    TypedResponse<{
      stream: Stream & {
        streamer: Pick<
          User,
          | "id"
          | "username"
          | "dispname"
          | "avatar_url"
          | "followerCount"
          | "promotionPoints"
          | "level"
        >;
      };
    }>
  >
) => {
  const { user } = req;
  const { id } = req.params;

  const host = await prismaClient.stream.findUnique({
    where: {
      id
    },
    select: {
      streamerId: true
    }
  });

  if (!host) {
    return res.status(httpStatus.NOT_FOUND).json({
      success: false,
      data: null,
      error: [...createErrorObject(httpStatus.NOT_FOUND, "Stream not found")]
    });
  }

  // check if host
  if (!user || user.id !== host.streamerId) {
    return res.status(httpStatus.FORBIDDEN).json({
      success: false,
      data: null,
      error: [
        ...createErrorObject(
          httpStatus.FORBIDDEN,
          "You are not the host of this stream."
        )
      ]
    });
  }

  try {
    const stream = await prismaClient.stream.update({
      where: {
        id
      },
      data: {
        active: true
      },
      include: {
        streamer: {
          select: {
            id: true,
            username: true,
            dispname: true,
            promotionPoints: true,
            level: true,
            avatar_url: true,
            followerCount: true
          }
        }
      }
    });

    // create notfication for all followers of the streamer that the stream started
    // get all followers
    const follower = await prismaClient.user.findUnique({
      where: { id: stream.streamer.id },
      select: {
        followedBy: {
          select: {
            followedById: true
          }
        }
      }
    });

    if (follower) {
      const notifications: Prisma.NotificationCreateManyInput[] =
        follower.followedBy.map((f) => ({
          type: "STREAM_STARTED",
          message: getNotificationsMessage(
            "STREAM_STARTED",
            stream.streamer.dispname
          ),
          userWhoFiredEvent: stream.streamer.id,
          streamId: stream.id,
          recipientId: f.followedById
        }));

      // create notification records
      await prismaClient.notification.createMany({
        data: notifications,
        skipDuplicates: true
      });
    }

    return res.status(httpStatus.OK).json({
      success: true,
      data: {
        stream
      },
      error: []
    });
  } catch {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      data: null,
      error: [
        ...createErrorObject(
          httpStatus.INTERNAL_SERVER_ERROR,
          "Stream couldn't be started, there was an internal sever error"
        )
      ]
    });
  }
};

export const getRecommended = async (
  _: Request,
  res: Response<
    TypedResponse<{
      streams: Array<
        Stream & {
          streamer: Pick<
            User,
            | "id"
            | "username"
            | "dispname"
            | "avatar_url"
            | "followerCount"
            | "promotionPoints"
            | "level"
          >;
        }
      >;
    }>
  >
) => {
  const streams = await prismaClient.stream.findMany({
    where: {
      active: true
    },
    include: {
      streamer: {
        select: {
          id: true,
          username: true,
          dispname: true,
          promotionPoints: true,
          level: true,
          avatar_url: true,
          followerCount: true
        }
      }
    },
    orderBy: {
      streamer: {
        promotionPoints: Prisma.SortOrder.desc
      }
    }
  });

  return res.status(httpStatus.OK).json({
    success: true,
    data: {
      streams
    },
    error: []
  });
};

export const deleteStream = async (
  req: Request<{ id: string }>,
  res: Response<
    TypedResponse<{
      stream: Stream & {
        streamer: Pick<
          User,
          | "id"
          | "username"
          | "dispname"
          | "avatar_url"
          | "followerCount"
          | "promotionPoints"
          | "level"
        >;
      };
    }>
  >
) => {
  const { user } = req;
  const { id } = req.params;

  const stream = await prismaClient.stream.findUnique({
    where: { id },
    select: { active: true, duration: true, streamerId: true }
  });

  if (!stream) {
    return res.status(httpStatus.NOT_FOUND).json({
      success: false,
      data: null,
      error: [...createErrorObject(httpStatus.NOT_FOUND, "Stream not found")]
    });
  }

  if (!user || user.id !== stream.streamerId) {
    return res.status(httpStatus.FORBIDDEN).json({
      success: false,
      data: null,
      error: [
        ...createErrorObject(
          httpStatus.FORBIDDEN,
          "You are not the host of this stream."
        )
      ]
    });
  }

  if (stream.active || stream.duration !== 0) {
    return res.status(httpStatus.FORBIDDEN).json({
      success: false,
      data: null,
      error: [
        ...createErrorObject(
          httpStatus.FORBIDDEN,
          "You cant delete this stream"
        )
      ]
    });
  }

  try {
    const stream = await prismaClient.stream.delete({
      where: {
        id
      },
      include: {
        streamer: {
          select: {
            id: true,
            username: true,
            dispname: true,
            promotionPoints: true,
            level: true,
            avatar_url: true,
            followerCount: true
          }
        }
      }
    });

    return res.status(httpStatus.OK).json({
      success: true,
      data: {
        stream
      },
      error: []
    });
  } catch {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      data: null,
      error: [
        ...createErrorObject(
          httpStatus.INTERNAL_SERVER_ERROR,
          "There was an internal Server error"
        )
      ]
    });
  }
};
