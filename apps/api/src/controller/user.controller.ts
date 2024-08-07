import type { Request, Response } from "express";
import httpStatus from "http-status";
import prismaClient from "../config/prisma";
import {
  CreateUserCredentials,
  Days,
  TypedRequest,
  TypedResponse
} from "../types/types";
import { decreaseFollowing, increaseFollowing } from "../service/user.service";
import {
  Achievement,
  Follows,
  Notification,
  Stream,
  User,
  UserToAchievement
} from "@prisma/client";
import { createErrorObject } from "../utils/createErrorObject";
import { getNotificationsMessage } from "../utils/notificationsMessages";
import path from "path";
import { uploadFileToBlob } from "../service/blob.service";
import { getDayOfWeek } from "../utils/getDayOfWeek";

export const getUserInfo = async (
  req: Request<{ id: string }>,
  res: Response<
    TypedResponse<{
      user: User & {
        subscribed: boolean;
        userToAchievement: (Pick<
          UserToAchievement,
          "progress" | "created_at" | "updated_at"
        > & { achievement: Achievement })[];
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
          progress: true,
          created_at: true,
          updated_at: true,
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

  let subscribed = false;

  if (user.id !== req.user!.id) {
    const checkSubscribed = await prismaClient.follows.findUnique({
      where: {
        followingId_followedById: {
          followedById: req.user!.id,
          followingId: user.id
        }
      }
    });
    subscribed = !!checkSubscribed;
  }

  const result = { ...user, subscribed };

  return res.status(httpStatus.OK).json({
    success: true,
    data: { user: result },
    error: []
  });
};

export const createUser = async (
  req: TypedRequest<CreateUserCredentials>,
  res: Response<
    TypedResponse<{
      user: Pick<
        User,
        "id" | "username" | "dispname" | "avatar_url" | "email" | "level"
      >;
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

  // Get all achievements a user can collect
  const getAllAchievements = await prismaClient.achievement.findMany({
    select: {
      id: true
    }
  });

  // create a relationship to all achievements
  const userToAchievementsData: { userId: string; achievementId: string }[] =
    getAllAchievements.map((v) => ({
      userId: id,
      achievementId: v.id
    }));

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
      avatar_url: true,
      level: true,
      email: true
    }
  });

  await prismaClient.userToAchievement.createMany({
    data: userToAchievementsData
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
      },
      include: {
        followedBy: {
          select: {
            dispname: true
          }
        }
      }
    });

    increaseFollowing(ownId, otherId);

    await prismaClient.notification.create({
      data: {
        type: "NEW_FOLLOWER",
        message: getNotificationsMessage(
          "NEW_FOLLOWER",
          follow.followedBy.dispname
        ),
        userWhoFiredEvent: ownId,
        recipientId: otherId
      }
    });

    return res.status(httpStatus.CREATED).json({
      success: true,
      data: {
        follow: { ...follow }
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
  req: Request<
    { id: string },
    object,
    object,
    { cursor?: string; limit?: string }
  >,
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
            | "followerCount"
            | "promotionPoints"
            | "level"
          > & {
            subscribed: boolean;
          };
        }
      >;
      nextCursor: string | null;
      hasNext: boolean;
    }>
  >
) => {
  try {
    const userId = req.params.id;
    const cursor = req.query.cursor;
    const limit = parseInt(req.query.limit || "20", 10);

    const [followingIds, recommendedStreams] = await Promise.all([
      prismaClient.user.findUnique({
        where: { id: userId },
        select: {
          following: {
            select: { followingId: true }
          }
        }
      }),
      prismaClient.stream.findMany({
        where: {
          active: true,
          NOT: { streamerId: userId }
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
            promotionPoints: "desc"
          }
        },
        take: limit + 1, // Fetch one more item than the limit to check if there's a next page
        ...(cursor && {
          skip: 1, // Do not include the cursor itself in the query result.
          cursor: {
            id: cursor
          }
        })
      })
    ]);

    if (!followingIds) {
      return res.status(httpStatus.NOT_FOUND).json({
        success: false,
        data: null,
        error: [...createErrorObject(httpStatus.NOT_FOUND, "User not found")]
      });
    }

    const followingMap = new Set(
      followingIds.following.map((f) => f.followingId)
    );

    const followedStreamsPromises = followingIds.following.map((following) =>
      prismaClient.stream.findFirst({
        where: {
          streamerId: following.followingId,
          active: true
        },
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
      })
    );

    const followedStreamsResults = await Promise.all(followedStreamsPromises);
    const followedStreams = followedStreamsResults.filter(
      (stream) => stream !== null
    ) as Array<Stream & { streamer: User }>;

    const allStreams = [
      ...followedStreams.map((stream) => ({
        ...stream,
        streamer: { ...stream.streamer, subscribed: true }
      })),
      ...recommendedStreams.map((stream) => ({
        ...stream,
        streamer: {
          ...stream.streamer,
          subscribed: followingMap.has(stream.streamer.id)
        }
      }))
    ];

    const uniqueStreams = allStreams.reduce(
      (acc: typeof allStreams, current) => {
        if (!acc.find((item) => item.id === current.id)) {
          acc.push(current);
        }
        return acc;
      },
      []
    );

    const hasNext = uniqueStreams.length > limit;
    const nextCursor = uniqueStreams.at(-1)?.id ?? "";

    return res.status(httpStatus.OK).json({
      success: true,
      data: {
        feed: uniqueStreams.slice(0, limit),
        nextCursor,
        hasNext
      },
      error: []
    });
  } catch (error) {
    console.error(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      data: null,
      error: [
        ...createErrorObject(
          httpStatus.INTERNAL_SERVER_ERROR,
          "Internal server error"
        )
      ]
    });
  }
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
          days: Days[];
          avgViewers: number;
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
          id: true, // cuid
          genre: true, // string that has the genres seperated via comma "genre1,genre2,genre3"
          created_at: true, // datetime
          mostViewers: true // int
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
  const genreDays = new Map<string, Map<Days, number>>(); // Map<genre, Map<day, count>>
  const genreViewers = new Map<
    string,
    { totalViewers: number; count: number }
  >();

  // Calculate which genres the user has streamed, how often, and accumulate viewers
  userData.streams.forEach((s) => {
    const day = getDayOfWeek(new Date(s.created_at));

    s.genre.split(",").forEach((g) => {
      genreStats.set(g, (genreStats.get(g) || 0) + 1);

      if (!genreDays.has(g)) {
        genreDays.set(g, new Map());
      }
      const dayMap = genreDays.get(g)!;
      dayMap.set(day, (dayMap.get(day) || 0) + 1);

      if (!genreViewers.has(g)) {
        genreViewers.set(g, { totalViewers: 0, count: 0 });
      }
      const viewerStats = genreViewers.get(g)!;
      viewerStats.totalViewers += s.mostViewers;
      viewerStats.count += 1;
    });
  });

  // Calculate percentage, most/second most streamed days, and avgViewers
  const totalStreams = userData.streams.length;
  const genres = Array.from(genreStats.entries()).map(([name, count]) => {
    const dayMap = genreDays.get(name)!;
    const sortedDays = Array.from(dayMap.entries()).sort((a, b) => b[1] - a[1]);
    const mostStreamedDays = sortedDays.slice(0, 2).map(([day]) => day);

    const viewerStats = genreViewers.get(name)!;
    const avgViewers = viewerStats.totalViewers / viewerStats.count;

    return {
      name,
      percent: (count / totalStreams) * 100,
      days: mostStreamedDays,
      avgViewers
    };
  });

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

export const getNotifications = async (
  req: Request<{ id: string }>,
  res: Response<
    TypedResponse<{
      notifications: Notification[];
    }>
  >
) => {
  const { id } = req.params;

  const notifications = await prismaClient.user.findUnique({
    where: { id },
    select: {
      notifications: {
        take: 30,
        orderBy: {
          created_at: "desc"
        }
      }
    }
  });

  if (!notifications) {
    return res.status(httpStatus.NOT_FOUND).json({
      success: false,
      data: null,
      error: [...createErrorObject(httpStatus.NOT_FOUND, "User not found")]
    });
  }

  return res.status(httpStatus.OK).json({
    success: true,
    data: {
      notifications: notifications.notifications
    },
    error: []
  });
};

export const updateUser = async (
  req: Request<
    { id: string },
    Record<string, unknown>,
    { dispname?: string; bio?: string }
  >,
  res: Response<
    TypedResponse<{
      user: User;
    }>
  >
) => {
  const { id } = req.params;
  const { user } = req;

  if (!user || user.id !== id) {
    return res.status(httpStatus.FORBIDDEN).json({
      success: false,
      data: null,
      error: [
        ...createErrorObject(
          httpStatus.FORBIDDEN,
          "You cannot update other users"
        )
      ]
    });
  }

  const checkUser = await prismaClient.user.findUnique({
    where: { id },
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

  const { dispname, bio } = req.body;

  if (!dispname && !bio && !req.file) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      data: null,
      error: [
        ...createErrorObject(
          httpStatus.BAD_REQUEST,
          "dispname, bio and file are all not defined. Define at least one"
        )
      ]
    });
  }

  let avatar_url = "";

  if (req.file) {
    try {
      const buffer = req.file.buffer;
      const fileExtension = path.extname(req.file.originalname);
      const blobName = `${crypto.randomUUID()}${fileExtension}`;

      const uploadedImage = await uploadFileToBlob(buffer, blobName);
      avatar_url = uploadedImage.url;
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

  const updatedUser = await prismaClient.user.update({
    where: { id },
    data: {
      ...(dispname && { dispname }),
      ...(bio && { bio }),
      ...(avatar_url && { avatar_url })
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
