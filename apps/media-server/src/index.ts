import express, { Express } from "express";
import { main } from "./app";
import logger from "./middleware/logger";
import cors from "cors";
import config from "./config/config";
import { createServer } from "http";

const app: Express = express();
const server = createServer(app);

app.use(
  cors({
    // origin is given a array if we want to have multiple origins later
    origin: String(config.cors.origin).split("|") ?? "*",
    credentials: true
  })
);

app.get("/", (_req, res) => {
  res.status(200).json({ msg: "Up" });
});

const port: number = Number(config.app.port) || 4041;

server.listen(port, config.app.host, () => {
  logger.log("info", `Server is running on Port: ${port}`);
  main();

  logger.info("Media server is running");
});

process.on("SIGTERM", () => {
  logger.info("SIGTERM signal received.");
  logger.info("Closing server.");
  server.close((err: unknown) => {
    logger.info("Server closed.");
    // eslint-disable-next-line no-process-exit
    process.exit(err ? 1 : 0);
  });
});
