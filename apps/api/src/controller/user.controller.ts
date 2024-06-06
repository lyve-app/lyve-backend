import type { Request, Response } from "express";
import httpStatus from "http-status";
import prismaClient from "../config/prisma";
import { CreateUserCredentials, TypedRequest } from "../types/types";
import { decreaseFollowing, increaseFollowing } from "../service/user.service";

export const getUserInfo = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  const user = await prismaClient.user.findUnique({
    where: { id: req.params.id },
    select: {
      id: true,
      username: true,
      dispname: true,
      bio: true,
      avatar_url: true,
      followingCount: true,
      followerCount: true,
      level: true,
      promotionPoints: true,
      coins: true
    }
  });

  // User not found
  if (!user) {
    return res.status(httpStatus.NOT_FOUND).json({
      success: false,
      data: null,
      error: [
        {
          name: "Not_found",
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
      success: false,
      data: null,
      error: [
        {
          name: "Bad_Request",
          code: "400",
          message: "id, username and email must be defined"
        }
      ]
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

export const followUser = async (
  req: Request<{ ownId: string; otherId: string }>,
  res: Response
) => {
  const { ownId, otherId } = req.body;

  try {
    const follow = await prismaClient.follows.create({
      data: {
        followedById: ownId,
        followingId: otherId
      }
    });

    increaseFollowing(ownId, otherId);

    return res.status(httpStatus.CREATED).json({
      success: true,
      data: {
        follow
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
          message: "already followed"
        }
      ]
    });
  }
};

export const unfollowUser = async (
  req: Request<{ ownId: string; otherId: string }>,
  res: Response
) => {
  const { ownId, otherId } = req.body;

  try {
    const deletedFollow = await prismaClient.follows.deleteMany({
      where: {
        followedById: ownId,
        followingId: otherId
      }
    });

    if (deletedFollow.count === 0) {
      return res.status(httpStatus.NOT_FOUND).json({
        success: false,
        data: null,
        error: [
          {
            name: "Not Found",
            code: "404",
            message: "Follow relationship not found"
          }
        ]
      });
    }

    decreaseFollowing(ownId, otherId);

    return res.status(httpStatus.OK).json({
      success: true,
      data: {
        message: "Unfollowed successfully"
      },
      error: "[]"
    });
  } catch {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      data: null,
      error: [
        {
          name: "Internal Server Error",
          code: "500",
          message: "An error occurred while unfollowing"
        }
      ]
    });
  }
};

export const following = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  const user = await prismaClient.user.findUnique({
    where: { id: req.params.id },
    select: {
      id: true,
      username: true,

      following: {
        include: {
          following: {
            select: {
              id: true,
              username: true
            }
          }
        }
      }
    }
  });

  return res.status(httpStatus.OK).json({
    success: true,
    data: {
      user
    },
    error: "[]"
  });
};

export const followedBy = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  const user = await prismaClient.user.findUnique({
    where: { id: req.params.id },
    select: {
      id: true,
      username: true,

      followedBy: {
        include: {
          followedBy: {
            select: {
              id: true,
              username: true
            }
          }
        }
      }
    }
  });

  return res.status(httpStatus.OK).json({
    success: true,
    data: {
      user
    },
    error: "[]"
  });
};
