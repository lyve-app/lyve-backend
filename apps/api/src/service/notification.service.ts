import { Achievement } from "@prisma/client";
import { getNotificationsMessage } from "../utils/notificationsMessages";
import prismaClient from "../config/prisma";

export const createAchievementNotification = async (
  userId: string,
  achievement: Achievement
) => {
  await prismaClient.notification.create({
    data: {
      type: "ACHIEVEMENT_RECEIVED",
      achievemntId: achievement.id,
      message: getNotificationsMessage(
        "ACHIEVEMENT_RECEIVED",
        achievement.name
      ),
      recipientId: userId
    }
  });
};
