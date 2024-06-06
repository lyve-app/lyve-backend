import type { Request, Response } from "express";
import httpStatus from "http-status";
import prismaClient from "../config/prisma";
import { Prisma, Stream, User } from "@prisma/client";
import {
  createStreamCredentials,
  TypedRequest,
  TypedResponse
} from "../types/types";
import { createErrorObject } from "../utils/createErrorObject";

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
  const stream = await prismaClient.stream.findFirst({
    where: { id: req.params.id },
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

  return res.status(httpStatus.OK).json({
    success: true,
    data: {
      stream: {
        ...stream,
        streamer: {
          ...stream.streamer,
          followed: false // Todo
        }
      }
    },
    error: []
  });
};

export const createStream = async (
  req: TypedRequest<createStreamCredentials>,
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
  const { streamerId, previewImgUrl, genre } = req.body;

  if (!streamerId || !previewImgUrl || !genre) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      data: null,
      error: [
        ...createErrorObject(
          httpStatus.BAD_REQUEST,
          "streamerId, image and genre must be defined"
        )
      ]
    });
  }

  const checkForActiveStreams = await prismaClient.stream.findFirst({
    where: {
      AND: [
        { streamerId: { equals: streamerId } },
        { active: { equals: true } }
      ]
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

  const stream = await prismaClient.stream.create({
    data: {
      streamerId: streamerId,
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
  const { id } = req.params;
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
          "Stream couldnt be started, there was an internal sever error"
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
  const { id } = req.params;

  const checkIfActive = await prismaClient.stream.findUnique({
    where: { id },
    select: { active: true, duration: true }
  });

  if (!checkIfActive) {
    return res.status(httpStatus.NOT_FOUND).json({
      success: false,
      data: null,
      error: [...createErrorObject(httpStatus.NOT_FOUND, "Stream not found")]
    });
  }

  // Todo check if host

  if (checkIfActive.active || checkIfActive.duration !== 0) {
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
