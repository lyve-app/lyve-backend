import type { User } from "@prisma/client";
import prismaClient from "../config/prisma";

export const createUser = async (
  id: string,
  username: string,
  dispname: string,
  email: string
): Promise<User> => {
  return await prismaClient.user.create({
    data: {
      id,
      username,
      dispname,
      email
    }
  });
};

export const increaseFollowing = async (ownId: string, otherId: string) => {
  try {
    await prismaClient.$transaction(async (prisma) => {
      await prisma.user.update({
        where: { id: ownId },
        data: {
          followingCount: {
            increment: 1
          }
        }
      });

      await prisma.user.update({
        where: { id: otherId },
        data: {
          followerCount: {
            increment: 1
          }
        }
      });
    });

    console.log(
      `Successfully increased following for user ${ownId} and follower for user ${otherId}`
    );
  } catch (error) {
    console.error("Error increasing following and follower counts:", error);
  }
};

export const decreaseFollowing = async (ownId: string, otherId: string) => {
  try {
    await prismaClient.$transaction(async (prisma) => {
      await prisma.user.update({
        where: { id: ownId },
        data: {
          followingCount: {
            decrement: 1
          }
        }
      });

      await prisma.user.update({
        where: { id: otherId },
        data: {
          followerCount: {
            decrement: 1
          }
        }
      });
    });

    console.log(
      `Successfully decreased following for user ${ownId} and follower for user ${otherId}`
    );
  } catch (error) {
    console.error("Error decreasing following and follower counts:", error);
  }
};
