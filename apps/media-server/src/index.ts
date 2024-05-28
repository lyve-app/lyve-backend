import { main } from "./app";
import logger from "./middleware/logger";

main();

logger.info("Media server is running");
