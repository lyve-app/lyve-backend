import amqp, { Channel } from "amqplib";
import config from "../config/config";
import logger from "../middleware/logger";
import { RabbitMQMessage } from "../types/rabbitmq";

export const initRabbitMQ = async (
  url: string,
  channel: Channel,
  messageHandler: (data: RabbitMQMessage) => void
): Promise<void> => {
  try {
    const connection = await amqp.connect(url);
    channel = await connection.createChannel();
    await channel.assertQueue(config.rabbitmq.queues.api_server_queue);
    await channel.assertQueue(config.rabbitmq.queues.media_server_queue);
    channel.consume(config.rabbitmq.queues.media_server_queue, (msg) => {
      if (msg !== null) {
        const data: RabbitMQMessage = JSON.parse(msg.content.toString());
        try {
          messageHandler(data);
        } catch (error) {
          logger.error("Error handling message:", error);
        }
        channel.ack(msg);
      }
    });
  } catch (error) {
    logger.error("Error initializing RabbitMQ:", error);
  }
};