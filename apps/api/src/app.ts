import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import compressFilter from "./utils/compressFilter.util";
import { errorHandler } from "./middleware/errorHandler";
import config from "./config/config";
import { xssMiddleware } from "./middleware/xssMiddleware";
import { createServer } from "http";
import { streamRouter, userRouter } from "./routes";

const app: Express = express();
const server = createServer(app);

// Helmet is used to secure this app by configuring the http-header
app.use(helmet());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

app.use(xssMiddleware());

app.use(cookieParser());

// Compression is used to reduce the size of the response body
app.use(compression({ filter: compressFilter }));

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

app.use("/api/user", userRouter);

app.use("/api/stream", streamRouter);

app.all("*", (_req, res) => {
  res.status(404).json({ error: "404 Not Found" });
});

app.use(errorHandler);

export default server;
