import config from "../config/config";
import { createLogger, format, transports } from "winston";

const logger = createLogger({
  level: config.node_env === "production" ? "info" : "debug",
  format: format.combine(
    format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss"
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json(),
    format.printf(({ timestamp, level, message, stack }) => {
      return `${timestamp} [${level.toUpperCase()}] ${message} ${
        stack ? `\n${stack}` : ""
      }`;
    })
  ),
  transports: [
    new transports.Console({
      stderrLevels: ["info"]
    })
  ]
});
export default logger;
