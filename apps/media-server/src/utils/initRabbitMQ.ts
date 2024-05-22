import amqp, { Connection } from "amqplib";
import config from "../config/config";
import logger from "../middleware/logger";
import {
  HandlerMap,
  IncomingChannelMessageData,
  OutgoingMessage,
  OutgoingMessageDataMap
} from "../types/rabbitmq";

let send = <Key extends keyof OutgoingMessageDataMap>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _obj: OutgoingMessage<Key>
) => {};

export const initRabbitMQ = async (url: string, handler: HandlerMap) => {
  logger.info("Trying to connect to RabbitMQ...");

  let conn: Connection;

  try {
    conn = await amqp.connect(url);
  } catch (err) {
    logger.error("Unable to connect to RabbitMQ: ", err);
    setTimeout(
      async () => await initRabbitMQ(url, handler),
      config.rabbitmq.retryInterval
    );
    return;
  }

  logger.info("Successfully connected to RabbitMQ");

  conn.on("close", async function (err: Error) {
    console.error("Rabbit connection closed with error: ", err);
    setTimeout(
      async () => await initRabbitMQ(url, handler),
      config.rabbitmq.retryInterval
    );
  });

  const channel = await conn.createChannel();

  const sendQueue = config.rabbitmq.queues.api_server_queue;
  const recvQueue = config.rabbitmq.queues.media_server_queue;

  await Promise.all([
    channel.assertQueue(recvQueue),
    channel.assertQueue(sendQueue)
  ]);

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
                send,
                (name, msg) => {
                  logger.error(`Error on operation: ${operation}`);
                  send({
                    op: "media-server-error",
                    data: {
                      name: name ?? "Unexpected Error",
                      msg:
                        msg ??
                        "The media-server is probably redeploying, it should reconnect in a few seconds. If not, try refreshing."
                    },
                    sid
                  });
                }
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
