import { Router } from "express";
import { streamController } from "../controller";

const streamRouter = Router();

streamRouter.post("/create", streamController.createStream);

streamRouter.get("/:id", streamController.getStreamInfo);

streamRouter.delete("/:id/delete", streamController.deleteStream);

streamRouter.put("/:id/start", streamController.activateStream);

streamRouter.put("/:id/end", streamController.endStream);

streamRouter.put("/recommended", streamController.getRecommended);

export default streamRouter;
