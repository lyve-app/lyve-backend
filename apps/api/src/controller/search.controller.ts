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
        users: Pick<
          User,
          "id" | "username" | "dispname" | "avatar_url" | "followerCount"
        >[];
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
          "query and limit must be defined"
        )
      ]
    });
  }

  // prisma query
  const userData = await prismaClient.user.findMany({
    take: 30,
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
            search: query
          }
        },
        {
          username: {
            search: query
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

  const next = await prismaClient.user.findMany({
    take: 30,

    skip: 1,
    cursor: {
      id: courser
    },

    where: {
      OR: [
        {
          dispname: {
            search: query
          }
        },
        {
          username: {
            search: query
          }
        }
      ]
    },
    select: {
      id: true
    }
  });

  return res.status(httpStatus.OK).json({
    success: true,
    data: {
      result: {
        users: userData
      },
      nextCursor: userData.at(-1)?.id ?? "",
      hasNext: next.length > 0
    },
    error: []
  });

  // return
};
