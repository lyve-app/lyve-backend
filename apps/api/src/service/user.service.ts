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
