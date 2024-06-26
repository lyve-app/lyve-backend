import type { Request, Response } from "express";
import httpStatus from "http-status";
import prismaClient from "../config/prisma";
import { User } from "@prisma/client";
import { TypedResponse } from "../types/types";
import { createErrorObject } from "../utils/createErrorObject";

export const search = async (
  req: Request<
    object,
    unknown,
    unknown,
    {
      query: string;
      curser: string;
      limit: string;
    }
  >,
  res: Response<
    TypedResponse<{
      result: {
        users: Array<
          Pick<
            User,
            "id" | "username" | "dispname" | "avatar_url" | "followerCount"
          > & { subscribed: boolean }
        >;
      };
      nextCursor: string;
      hasNext: boolean;
    }>
  >
) => {
  const { query, curser, limit } = req.query;

  if (!query || !limit) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      data: null,
      error: [
        ...createErrorObject(
          httpStatus.BAD_REQUEST,
          "Query and limit must be defined."
        )
      ]
    });
  }

  // Parse limit as an integer
  const parsedLimit = parseInt(limit, 10);
  if (isNaN(parsedLimit) || parsedLimit <= 0) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      data: null,
      error: [
        ...createErrorObject(
          httpStatus.BAD_REQUEST,
          "limit must be a positive integer"
        )
      ]
    });
  }

  try {
    const { user } = req;

    if (!user) {
      return res.status(httpStatus.FORBIDDEN).json({
        success: false,
        data: null,
        error: [
          ...createErrorObject(
            httpStatus.FORBIDDEN,
            "Access denied. Invalid token"
          )
        ]
      });
    }

    const userFollowings = await prismaClient.user.findUnique({
      where: {
        id: user.id
      },
      select: {
        following: {
          select: {
            followingId: true
          }
        }
      }
    });

    if (!userFollowings) {
      return res.status(httpStatus.NOT_FOUND).json({
        success: false,
        data: null,
        error: [...createErrorObject(httpStatus.NOT_FOUND, "User not found.")]
      });
    }

    const followingMap = new Set(
      userFollowings.following.map((f) => f.followingId)
    );

    // prisma query
    const userData = await prismaClient.user.findMany({
      take: parsedLimit + 1, // Fetch one more item than the limit to check if there's a next page
      ...(curser && {
        skip: 1, // Do not include the cursor itself in the query result.
        cursor: {
          id: curser
        }
      }),
      where: {
        OR: [
          {
            dispname: {
              contains: query,
              mode: "insensitive"
            }
          },
          {
            username: {
              contains: query,
              mode: "insensitive"
            }
          }
        ]
      },
      select: {
        id: true,
        username: true,
        dispname: true,
        avatar_url: true,
        followerCount: true
      }
    });

    // if nextCourser is undefined we dont need to run the next query so we
    // set hasNext false here and only update when nextCourser is defined
    const hasNext = userData.length > parsedLimit;
    const nextCurser = userData.at(-1)?.id;

    const responseData: Array<
      Pick<
        User,
        "id" | "username" | "dispname" | "avatar_url" | "followerCount"
      > & { subscribed: boolean }
    > = userData.map((u) => ({
      ...u,
      subscribed: followingMap.has(u.id)
    }));

    return res.status(httpStatus.OK).json({
      success: true,
      data: {
        result: {
          users: responseData
        },
        nextCursor: nextCurser ?? "",
        hasNext
      },
      error: []
    });
  } catch (error) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      data: null,
      error: createErrorObject(
        httpStatus.INTERNAL_SERVER_ERROR,
        "An error occurred while processing your request."
      )
    });
  }
};
