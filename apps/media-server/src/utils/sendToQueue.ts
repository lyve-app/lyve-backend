import { Channel } from "amqplib";
import config from "../config/config";

export const sendToQueue = (
  channel: Channel,
  queue: keyof typeof config.rabbitmq.queues,
  message: unknown
) => {
  channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
};
