import type { Response } from "express";
import httpStatus from "http-status";
import prismaClient from "../config/prisma";
import { TypedRequest, createStreamCredentials } from "../types/types";

export const dummyfunc = () => {
  return "0";
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
      active: true,
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
