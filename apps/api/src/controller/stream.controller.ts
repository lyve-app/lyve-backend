import type { Request, Response } from "express";
import httpStatus from "http-status";
import prismaClient from "../config/prisma";
import { TypedRequest, createStreamCredentials } from "../types/types";

export const dummyfunc = () => {
  return "0";
};

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
          name: "not found",
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
          name: "BAD_REQUEST",
          code: "400",
          msg: "id, image and genre must be defined"
        }
      ]
    });
  }

  await prismaClient.stream.create({
    data: {
      streamerId: streamerId,
      previewImgUrl: previewImgUrl,
      genre: genre
    }
  });

  return res.status(httpStatus.CREATED).json({
    success: true,
    data: {
      id: "",
      serverId: "",
      active: false,
      streamer: {
        id: streamerId,
        username: "",
        promotionPoints: "",
        level: "",
        avatar_url: "",
        followerCount: "",
        followed: "false"
      },
      previewImgUrl: previewImgUrl,
      viewerCount: "",
      genre: "",
      created_at: ""
    },
    error: []
  });
};
