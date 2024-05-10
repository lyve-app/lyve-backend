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
  const { serverId, streamerId, previewImgUrl, genre } = req.body;

  if (!serverId || !streamerId || !previewImgUrl || !genre) {
    return res.status(httpStatus.BAD_REQUEST).json({
      message: "id, image and genre must be defined"
    });
  }

  await prismaClient.stream.create({
    data: {
      serverId: serverId,
      streamerId: streamerId,
      previewImgUrl: previewImgUrl,
      genre: genre
    }
  });

  return res.sendStatus(httpStatus.CREATED);
};
