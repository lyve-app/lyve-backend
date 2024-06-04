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
    // Start a transaction
    await prismaClient.$transaction(async (prisma) => {
      // Increase the following count of the user with ownId
      await prisma.user.update({
        where: { id: ownId },
        data: {
          followingCount: {
            increment: 1
          }
        }
      });

      // Increase the follower count of the user with otherId
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
