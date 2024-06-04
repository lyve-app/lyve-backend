import { Channel } from "amqplib";
import logger from "../middleware/logger";
import {
  HandlerMap,
  IncomingChannelMessageData,
  OutgoingMessage,
  OutgoingMessageDataMap
} from "../types/rabbitmq";
import config from "../config/config";

let send = <Key extends keyof OutgoingMessageDataMap>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _obj: OutgoingMessage<Key>
) => {};

export const initRabbitMQ = async (channel: Channel, handler: HandlerMap) => {
  const sendQueue = config.rabbitmq.queues.media_server_queue;
  const recvQueue = config.rabbitmq.queues.api_server_queue;

  if (!channel) {
    return;
  }

  send = <Key extends keyof OutgoingMessageDataMap>(
    obj: OutgoingMessage<Key>
  ) => {
    channel.sendToQueue(sendQueue, Buffer.from(JSON.stringify(obj)));
  };
  await channel.purgeQueue(recvQueue);

  await channel.consume(
    recvQueue,
    async (msg) => {
      if (msg !== null) {
        const m = msg.content.toString();
        if (m) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          let data: IncomingChannelMessageData<any> | undefined;
          try {
            data = JSON.parse(m);
          } catch (err) {
            logger.error("Error on JSON.parse: ", err);
          }
          // console.log(data.op);
          if (data && data.op && data.op in handler) {
            const { data: handlerData, op: operation, sid } = data;
            try {
              logger.debug(`Received ${operation} operation`);
              // eslint-disable-next-line @typescript-eslint/await-thenable
              await handler[operation as keyof HandlerMap](
                handlerData,
                sid,
                send
              );
            } catch (err) {
              logger.error(`Error on operation: ${operation}: `, err);
            }
          }
        }
      }
    },
    { noAck: true }
  );
};
