import type { Request, Response } from "express";
import httpStatus from "http-status";
import prismaClient from "../config/prisma";
import {
  CreateUserCredentials,
  TypedRequest,
  TypedResponse
} from "../types/types";
import { decreaseFollowing, increaseFollowing } from "../service/user.service";
import { AchievementType, Follows, Stream, User } from "@prisma/client";
import { createErrorObject } from "src/utils/createErrorObject";

export const getUserInfo = async (
  req: Request<{ id: string }>,
  res: Response<
    TypedResponse<{
      user: User & {
        userToAchievement: {
          achievement: {
            id: string;
            type: AchievementType;
            name: string;
            level: number;
            bannerUrl: string;
            condition: number;
            progress: number;
            promotionPoints: number;
          };
        }[];
        streams: Stream[];
      };
    }>
  >
) => {
  const user = await prismaClient.user.findUnique({
    where: { id: req.params.id },
    include: {
      streams: true,
      userToAchievement: {
        select: {
          achievement: true
        }
      }
    }
  });

  // User not found
  if (!user) {
    return res.status(httpStatus.NOT_FOUND).json({
      success: false,
      data: null,
      error: [...createErrorObject(httpStatus.NOT_FOUND, "User not Found")]
    });
  }

  return res.status(httpStatus.OK).json({
    success: true,
    data: { user },
    error: []
  });
};

export const createUser = async (
  req: TypedRequest<CreateUserCredentials>,
  res: Response<
    TypedResponse<{
      user: Pick<User, "id" | "username" | "dispname" | "email">;
    }>
  >
) => {
  const { id, username, email } = req.body;

  if (!id || !username || !email) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      data: null,
      error: [
        ...createErrorObject(
          httpStatus.BAD_REQUEST,
          "id, username and email must be defined"
        )
      ]
    });
  }

  const user = await prismaClient.user.findMany({
    where: { OR: [{ id: id }, { email: email }] },
    select: {
      id: true
    }
  });

  if (user.length > 0) {
    return res.status(httpStatus.CONFLICT).json({
      success: false,
      data: null,
      error: [...createErrorObject(httpStatus.CONFLICT)]
    });
  }

  const newUser = await prismaClient.user.create({
    data: {
      id,
      username,
      dispname: username,
      email
    },
    select: {
      id: true,
      username: true,
      dispname: true,
      email: true
    }
  });

  return res.status(httpStatus.CREATED).json({
    success: true,
    data: {
      user: newUser
    },
    error: []
  });
};

export const followUser = async (
  req: TypedRequest<{ ownId: string; otherId: string }>,
  res: Response<
    TypedResponse<{
      follow: Follows;
    }>
  >
) => {
  const { ownId, otherId } = req.body;

  if (!ownId || !otherId) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      data: null,
      error: [
        ...createErrorObject(
          httpStatus.BAD_REQUEST,
          "ownId and otherId must be defined"
        )
      ]
    });
  }

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
      error: []
    });
  } catch {
    return res.status(httpStatus.CONFLICT).json({
      success: false,
      data: null,
      error: [
        ...createErrorObject(
          httpStatus.CONFLICT,
          "You already follows this user"
        )
      ]
    });
  }
};

export const unfollowUser = async (
  req: TypedRequest<{ ownId: string; otherId: string }>,
  res: Response<
    TypedResponse<{
      follow: Follows;
    }>
  >
) => {
  const { ownId, otherId } = req.body;

  if (!ownId || !otherId) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      data: null,
      error: [
        ...createErrorObject(
          httpStatus.BAD_REQUEST,
          "ownId and otherId must be defined"
        )
      ]
    });
  }

  try {
    const deletedFollow = await prismaClient.follows.delete({
      where: {
        followingId_followedById: {
          followedById: ownId,
          followingId: otherId
        }
      }
    });

    decreaseFollowing(ownId, otherId);

    return res.status(httpStatus.OK).json({
      success: true,
      data: {
        follow: deletedFollow
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
          "An error occurred while unfollowing"
        )
      ]
    });
  }
};

export const following = async (
  req: Request<{ id: string }>,
  res: Response<
    TypedResponse<{
      user: Pick<User, "id" | "username" | "followingCount"> & {
        following: {
          created_at: Date;
          user: Pick<User, "id" | "username" | "avatar_url" | "dispname">;
        }[];
      };
    }>
  >
) => {
  const userFollowingData = await prismaClient.user.findUnique({
    where: { id: req.params.id },
    select: {
      id: true,
      username: true,
      followingCount: true,
      following: {
        select: {
          created_at: true,
          following: {
            select: {
              id: true,
              username: true,
              dispname: true,
              avatar_url: true
            }
          }
        }
      }
    }
  });

  if (!userFollowingData) {
    return res.status(httpStatus.NOT_FOUND).json({
      success: false,
      data: null,
      error: [...createErrorObject(httpStatus.NOT_FOUND, "User not found")]
    });
  }

  const followingData: {
    created_at: Date;
    user: Pick<User, "id" | "username" | "avatar_url" | "dispname">;
  }[] = [];

  for (const f of userFollowingData.following) {
    followingData.push({
      created_at: f.created_at,
      user: f.following
    });
  }
  return res.status(httpStatus.OK).json({
    success: true,
    data: {
      user: {
        id: userFollowingData.id,
        username: userFollowingData.username,
        followingCount: userFollowingData.followingCount,
        following: followingData
      }
    },
    error: []
  });
};

export const followedBy = async (
  req: Request<{ id: string }>,
  res: Response<
    TypedResponse<{
      user: Pick<User, "id" | "username" | "followerCount"> & {
        followedBy: {
          subscribed: boolean;
          created_at: Date;
          user: Pick<User, "id" | "username" | "dispname" | "avatar_url">;
        }[];
      };
    }>
  >
) => {
  const user = await prismaClient.user.findUnique({
    where: { id: req.params.id },
    select: {
      id: true,
      username: true,
      followerCount: true,
      following: {
        select: {
          followingId: true
        }
      },
      followedBy: {
        select: {
          created_at: true,
          followedBy: {
            select: {
              id: true,
              username: true,
              avatar_url: true,
              dispname: true
            }
          }
        }
      }
    }
  });

  if (!user) {
    return res.status(httpStatus.NOT_FOUND).json({
      success: false,
      data: null,
      error: [...createErrorObject(httpStatus.NOT_FOUND, "User not found")]
    });
  }

  // create a set
  const followingMap = new Set(user.following.map((f) => f.followingId));

  const followerData: {
    created_at: Date;
    subscribed: boolean;
    user: Pick<User, "id" | "username" | "avatar_url" | "dispname">;
  }[] = [];

  for (const f of user.followedBy) {
    followerData.push({
      subscribed: followingMap.has(f.followedBy.id),
      created_at: f.created_at,
      user: f.followedBy
    });
  }

  return res.status(httpStatus.OK).json({
    success: true,
    data: {
      user: {
        id: user.id,
        username: user.username,
        followerCount: user.followerCount,
        followedBy: followerData
      }
    },
    error: []
  });
};

export const getFeed = async (
  req: Request<{ id: string }>,
  res: Response<
    TypedResponse<{
      feed: Array<
        Stream & {
          streamer: Pick<
            User,
            | "id"
            | "username"
            | "dispname"
            | "avatar_url"
            | "promotionPoints"
            | "level"
          >;
        }
      >;
    }>
  >
) => {
  const followingIds = await prismaClient.user.findUnique({
    where: { id: req.params.id },
    select: {
      following: {
        select: { followingId: true }
      }
    }
  });

  if (!followingIds) {
    return res.status(httpStatus.NOT_FOUND).json({
      success: false,
      data: null,
      error: [...createErrorObject(httpStatus.NOT_FOUND, "User not found")]
    });
  }

  const streams: Array<
    Stream & {
      streamer: Pick<
        User,
        | "id"
        | "username"
        | "dispname"
        | "avatar_url"
        | "promotionPoints"
        | "level"
      >;
    }
  > = [];

  for (const following of followingIds.following) {
    const streamData = await prismaClient.stream.findFirst({
      where: {
        streamerId: { equals: following.followingId },
        active: { equals: true }
      },
      include: {
        streamer: {
          select: {
            id: true,
            username: true,
            avatar_url: true,
            dispname: true,
            promotionPoints: true,
            level: true
          }
        }
      }
    });

    // check if null
    if (streamData) {
      streams.push(streamData);
    }
  }

  return res.status(httpStatus.OK).json({
    success: true,
    data: { feed: streams },
    error: []
  });
};

export const getMostStreamedGenres = async (
  req: Request<{ id: string }>,
  res: Response<
    TypedResponse<{
      user: {
        numStreams: number;
        genres: {
          name: string;
          percent: number;
        }[];
      };
    }>
  >
) => {
  const userData = await prismaClient.user.findUnique({
    where: { id: req.params.id },
    select: {
      streams: {
        select: {
          id: true,
          genre: true
        }
      }
    }
  });

  if (!userData) {
    return res.status(httpStatus.NOT_FOUND).json({
      success: false,
      data: null,
      error: [...createErrorObject(httpStatus.NOT_FOUND, "User not found")]
    });
  }

  const genreStats = new Map<string, number>();

  // Calculate which genres the user has streamed and how often
  userData.streams.forEach((s) =>
    s.genre
      .split(",")
      .forEach((g) => genreStats.set(g, (genreStats.get(g) || 0) + 1))
  );

  // Calculate percentage
  const totalStreams = userData.streams.length;
  const genres = Array.from(genreStats.entries()).map(([name, count]) => ({
    name,
    percent: count / totalStreams
  }));

  return res.status(httpStatus.OK).json({
    success: true,
    data: {
      user: {
        numStreams: totalStreams,
        genres
      }
    },
    error: []
  });
};

export const updateUser = async (
  req: Request<
    { id: string },
    Record<string, unknown>,
    { dispname?: string; avatar_url?: string; bio?: string }
  >,
  res: Response<
    TypedResponse<{
      user: User;
    }>
  >
) => {
  const checkUser = await prismaClient.user.findUnique({
    where: { id: req.params.id },
    select: {
      dispname: true,
      avatar_url: true,
      bio: true
    }
  });

  if (!checkUser) {
    return res.status(httpStatus.NOT_FOUND).json({
      success: false,
      data: null,
      error: [...createErrorObject(httpStatus.NOT_FOUND, "User not found")]
    });
  }

  const { dispname, avatar_url, bio } = req.body;

  const updatedUser = await prismaClient.user.update({
    where: { id: req.params.id },
    data: {
      dispname: dispname ?? checkUser.dispname,
      avatar_url: avatar_url ?? checkUser.avatar_url,
      bio: bio ?? checkUser.bio
    }
  });

  return res.status(httpStatus.OK).json({
    success: true,
    data: {
      user: updatedUser
    },
    error: []
  });
};
