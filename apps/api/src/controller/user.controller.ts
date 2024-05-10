import type { Request, Response } from "express";
import httpStatus from "http-status";
import prismaClient from "../config/prisma";
import { CreateUserCredentials, TypedRequest } from "../types/types";

export const getUserInfo = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  const user = await prismaClient.user.findUnique({
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
  if (!user) {
    return res.status(httpStatus.NOT_FOUND).json({
      success: false,
      data: null,
      error: [
        {
          name: "not found",
          code: 404,
          message: "user not found"
        }
      ]
    });
  }

  return res.status(httpStatus.OK).json({
    success: true,
    data: {
      user
    },
    error: "[]"
  });
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
      username: true,
      email: true
    }
  });

  if (user.length > 0) {
    return res.status(httpStatus.CONFLICT).json({
      success: false,
      data: null,
      error: [
        {
          name: "Conflict",
          code: "409",
          msg: ""
        }
      ]
    });
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
    success: true,
    data: {
      user: {
        id: id,
        username: username,
        email: email
      }
    },
    error: []
  });
};
