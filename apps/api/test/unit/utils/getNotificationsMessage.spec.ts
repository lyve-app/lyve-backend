import { NotificationType } from "@prisma/client";
import { getNotificationsMessage } from "../../../src/utils/notificationsMessages";

describe("getNotificationsMessage function", () => {
  const name = "JohnDoe";

  it("should return a random message for STREAM_STARTED", () => {
    const result = getNotificationsMessage(
      NotificationType.STREAM_STARTED,
      name
    );
    const possibleMessages = [
      `Heads up! ${name} is live now. Join the stream and enjoy!`,
      `Tune in now! ${name} has just started streaming. Don’t miss out!`,
      `Alert! ${name} is live. Catch all the live action now!`,
      `${name} is streaming live. Click to join and watch the show!`
    ];
    expect(possibleMessages).toContain(result);
  });

  it("should return a random message for REWARD_RECEIVED", () => {
    const result = getNotificationsMessage(
      NotificationType.REWARD_RECEIVED,
      name
    );
    const possibleMessages = [
      `You've received a reward from ${name}! Thanks for creating awesome content!`,
      `Amazing! ${name} just sent you a reward. Keep up the great work!`,
      `Wow! ${name} has rewarded you for your stream. Thank you for your efforts!`,
      `You've been rewarded by ${name}! Your content is truly appreciated.`
    ];
    expect(possibleMessages).toContain(result);
  });

  it("should return a random message for NEW_FOLLOWER", () => {
    const result = getNotificationsMessage(NotificationType.NEW_FOLLOWER, name);
    const possibleMessages = [
      `${name} is now following you! Welcome them to your community.`,
      `Exciting news! ${name} just followed you. Say hello!`,
      `You have a new follower: ${name}. Thanks for growing your community!`,
      `${name} has joined your follower list. Keep engaging with your fans!`
    ];
    expect(possibleMessages).toContain(result);
  });

  it("should return a random message for ACHIEVEMENT_RECEIVED", () => {
    const result = getNotificationsMessage(
      NotificationType.ACHIEVEMENT_RECEIVED,
      name
    );
    const possibleMessages = [
      `Fantastic! You've unlocked the ${name} achievement. Well done!`,
      `Achievement unlocked! You’ve earned ${name}. Keep it up!`,
      `Congrats! You've achieved ${name}. Your dedication is paying off!`,
      `You've earned the ${name} achievement. Great job and keep striving!`
    ];
    expect(possibleMessages).toContain(result);
  });
});
