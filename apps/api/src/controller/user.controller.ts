import type { Request, Response } from "express";
import httpStatus from "http-status";
import prismaClient from "../config/prisma";
import { CreateUserCredentials, TypedRequest } from "../types/types";

export const getUserInfo = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  const userInfo = await prismaClient.user.findUnique({
    where: { id: req.params.id },
    select: {
      id: true,
      username: true,
      bio: true,
      avatar_url: true,
      followingCount: true,
      followerCount: true,
      level: true
    }
  });

  // User not found
  if (!userInfo) {
    return res.status(httpStatus.NOT_FOUND).json({ message: "User not found" });
  }

  return res.status(httpStatus.OK).json(userInfo);
};

export const createUser = async (
  req: TypedRequest<CreateUserCredentials>,
  res: Response
) => {
  const { id, username, email } = req.body;

  if (!id || !username || !email) {
    return res.status(httpStatus.BAD_REQUEST).json({
      message: "id, username and email must be defined"
    });
  }

  const user = await prismaClient.user.findMany({
    where: { OR: [{ id: id }, { email: email }] },
    select: {
      id: true,
      email: true
    }
  });

  if (user.length > 0) {
    return res.sendStatus(httpStatus.CONFLICT);
  }

  await prismaClient.user.create({
    data: {
      id,
      username,
      dispname: username,
      email
    }
  });

  return res.status(httpStatus.CREATED).json({
    id: id,
    username: username,
    dispname: username,
    email: email
  });
};
