import { NotificationType } from "@prisma/client";

export const getNotificationsMessage = (
  type: NotificationType,
  name: string
): string => {
  const notificationsMessages: { [Key in NotificationType]: string[] } = {
    STREAM_STARTED: [
      `Heads up! ${name} is live now. Join the stream and enjoy!`,
      `Tune in now! ${name} has just started streaming. Don’t miss out!`,
      `Alert! ${name} is live. Catch all the live action now!`,
      `${name} is streaming live. Click to join and watch the show!`
    ],
    REWARD_RECEIVED: [
      `You've received a reward from ${name}! Thanks for creating awesome content!`,
      `Amazing! ${name} just sent you a reward. Keep up the great work!`,
      `Wow! ${name} has rewarded you for your stream. Thank you for your efforts!`,
      `You've been rewarded by ${name}! Your content is truly appreciated.`
    ],
    NEW_FOLLOWER: [
      `${name} is now following you! Welcome them to your community.`,
      `Exciting news! ${name} just followed you. Say hello!`,
      `You have a new follower: ${name}. Thanks for growing your community!`,
      `${name} has joined your follower list. Keep engaging with your fans!`
    ],
    ACHIEVEMENT_RECEIVED: [
      `Fantastic! You've unlocked the ${name} achievement. Well done!`,
      `Achievement unlocked! You’ve earned ${name}. Keep it up!`,
      `Congrats! You've achieved ${name}. Your dedication is paying off!`,
      `You've earned the ${name} achievement. Great job and keep striving!`
    ]
  };

  const messages = notificationsMessages[type];

  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex]!;
};
