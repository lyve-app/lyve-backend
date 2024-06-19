import logger from "../middleware/logger";
import prismaClient from "../config/prisma";
import { createAchievementNotification } from "./notification.service";

/**
 * Checks and updates the progress of the achievements for a specific user
 * @param userId UserID
 * @returns Promise<void>
 */
export const handleAchievements = async (userId: string) => {
  try {
    const userData = await prismaClient.user.findUnique({
      where: {
        id: userId
      },
      select: {
        id: true,
        numStreams: true,
        num10minStreams: true,
        minStreamed: true,
        userToAchievement: {
          include: {
            achievement: true
          }
        },
        streams: {
          select: {
            id: true,
            mostViewers: true
          }
        }
      }
    });

    if (!userData || !userData.streams) return;

    const mostViewers = Math.max(
      ...userData.streams.map((stream) => stream.mostViewers)
    );

    for (const uta of userData.userToAchievement) {
      const achievement = uta.achievement;

      // if progress equals condition we dont need to update something
      if (uta.progress === achievement.condition) continue;

      switch (achievement.type) {
        case "NTH_STREAM": {
          if (
            userData.num10minStreams > uta.progress &&
            userData.num10minStreams <= achievement.condition
          ) {
            await updateProgress(
              uta.userId,
              uta.achievementId,
              userData.num10minStreams
            );
          } else if (
            userData.num10minStreams > uta.progress &&
            userData.num10minStreams > achievement.condition
          ) {
            await updateProgress(
              uta.userId,
              uta.achievementId,
              achievement.condition
            );
          }

          // user has achieved the achievement
          if (userData.num10minStreams >= achievement.condition) {
            await createAchievementNotification(userId, achievement);
          }
          break;
        }
        case "MINUTES_STREAMED": {
          if (
            userData.minStreamed > uta.progress &&
            userData.minStreamed <= achievement.condition
          ) {
            await updateProgress(
              uta.userId,
              uta.achievementId,
              userData.minStreamed
            );
          } else if (
            userData.minStreamed > uta.progress &&
            userData.minStreamed > achievement.condition
          ) {
            await updateProgress(
              uta.userId,
              uta.achievementId,
              achievement.condition
            );
          }

          // user has achieved the achievement
          if (userData.minStreamed >= achievement.condition) {
            await createAchievementNotification(userId, achievement);
          }
          break;
        }
        case "NTH_VIEWERS": {
          if (
            mostViewers > uta.progress &&
            mostViewers <= achievement.condition
          ) {
            await updateProgress(uta.userId, uta.achievementId, mostViewers);
          } else if (
            mostViewers > uta.progress &&
            mostViewers > achievement.condition
          ) {
            await updateProgress(
              uta.userId,
              uta.achievementId,
              achievement.condition
            );
          }

          // user has achieved the achievement
          if (mostViewers >= achievement.condition) {
            await createAchievementNotification(userId, achievement);
          }
          break;
        }
        default:
          break;
      }
    }
  } catch (error) {
    logger.error("Error on handleAchievments: ", error);
  }
};

export const updateProgress = async (
  userId: string,
  achievementId: string,
  progress: number
): Promise<void> => {
  try {
    await prismaClient.userToAchievement.update({
      where: { userId_achievementId: { userId, achievementId } },
      data: { progress }
    });
  } catch (error) {
    logger.error("Error on updateProgress: ", error);
  }
};
