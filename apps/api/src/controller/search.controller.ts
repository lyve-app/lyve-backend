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
      courser: string;
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
  const { query, courser, limit } = req.query;

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
    // prisma query
    const userData = await prismaClient.user.findMany({
      take: parsedLimit,
      ...(courser && {
        skip: 1, // Do not include the cursor itself in the query result.
        cursor: {
          id: courser
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
    let hasNext = false;
    const nextCourser = userData.at(-1)?.id;

    if (nextCourser) {
      const next = await prismaClient.user.findMany({
        take: parsedLimit,

        skip: 1,
        cursor: {
          id: nextCourser
        },

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
          id: true
        }
      });

      hasNext = next.length > 0;
    }

    // Todo add real subscribed value
    const responseData: Array<
      Pick<
        User,
        "id" | "username" | "dispname" | "avatar_url" | "followerCount"
      > & { subscribed: boolean }
    > = userData.map((u) => ({
      ...u,
      subscribed: false
    }));

    return res.status(httpStatus.OK).json({
      success: true,
      data: {
        result: {
          users: responseData
        },
        nextCursor: nextCourser ?? "",
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
