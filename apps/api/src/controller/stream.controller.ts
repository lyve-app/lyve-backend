import type { Request, Response } from "express";
import httpStatus from "http-status";
import prismaClient from "../config/prisma";
import { Prisma } from "@prisma/client";
import { createStreamCredentials, TypedRequest } from "../types/types";

export const getStreamInfo = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  const stream = await prismaClient.stream.findFirst({
    where: { id: req.params.id },
    select: {
      id: true,
      serverId: true,
      active: true,
      streamer: true,
      previewImgUrl: true,
      viewerCount: true,
      genre: true,
      created_at: true
    }
  });

  if (!stream) {
    return res.status(httpStatus.NOT_FOUND).json({
      success: false,
      data: null,
      error: [
        {
          name: "Not_found",
          code: "404",
          message: "stream not found"
        }
      ]
    });
  }

  return res.status(httpStatus.OK).json({
    success: true,
    data: {
      stream
    },
    error: "[]"
  });
};

export const createStream = async (
  req: TypedRequest<createStreamCredentials>,
  res: Response
) => {
  const { streamerId, previewImgUrl, genre } = req.body;

  if (!streamerId || !previewImgUrl || !genre) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      data: null,
      error: [
        {
          name: "Bad_Request",
          code: "400",
          msg: "id, image and genre must be defined"
        }
      ]
    });
  }
  //TODO add try-catch
  const stream = await prismaClient.stream.create({
    data: {
      streamerId: streamerId,
      previewImgUrl: previewImgUrl,
      genre: genre
    },
    select: {
      id: true,
      serverId: true,
      active: true,
      streamer: {
        select: {
          id: true,
          username: true,
          promotionPoints: true,
          level: true,
          avatar_url: true,
          followerCount: true
        }
      },
      previewImgUrl: true,
      viewerCount: true,
      genre: true,
      created_at: true
    }
  });

  //TODO select created stream and return in json prob with a service
  return res.status(httpStatus.CREATED).json({
    success: true,
    data: {
      ...stream
    },
    error: []
  });
};

export const deleteStream = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  const { id } = req.params;

  try {
    const deletedStream = await prismaClient.stream.delete({
      where: {
        streamerId: id
      }
    });

    return res.status(httpStatus.OK).json({
      success: true,
      data: {
        deletedStream
      },
      error: "[]"
    });
  } catch {
    return res.status(httpStatus.CONFLICT).json({
      success: false,
      data: null,
      error: [
        {
          name: "Conflict",
          code: "409",
          message: ""
        }
      ]
    });
  }
};

export const activateStream = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  const { id } = req.params;
  try {
    const stream = await prismaClient.stream.update({
      where: {
        streamerId: id
      },
      data: {
        active: true
      }
    });

    return res.status(httpStatus.OK).json({
      success: true,
      data: {
        stream
      },
      error: "[]"
    });
  } catch {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      data: null,
      error: [
        {
          name: "Bad_request",
          code: "400",
          message: "Stream couldn't be activated"
        }
      ]
    });
  }
};

export const endStream = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  const { id } = req.params;
  try {
    const stream = await prismaClient.stream.update({
      where: {
        streamerId: id
      },
      data: {
        active: false
      }
    });

    return res.status(httpStatus.OK).json({
      success: true,
      data: {
        stream
      },
      error: "[]"
    });
  } catch {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      data: null,
      error: [
        {
          name: "Bad_request",
          code: "400",
          message: "Stream couldn't be deactivated"
        }
      ]
    });
  }
};

export const getRecommended = async (_: Request, res: Response) => {
  const recommendedStreams = await prismaClient.stream.findMany({
    where: {
      active: true
    },
    orderBy: {
      streamer: {
        promotionPoints: Prisma.SortOrder.desc
      }
    }
  });

  if (recommendedStreams.length === 0) {
    return res.status(httpStatus.NOT_FOUND).json({
      success: false,
      data: null,
      error: [
        {
          name: "Not_found",
          code: "404",
          message: "no streams found"
        }
      ]
    });
  }

  return res.status(httpStatus.OK).json({
    success: true,
    data: {
      recommendedStreams
    },
    error: "[]"
  });
};
