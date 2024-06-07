import { Router } from "express";
import { streamController } from "../controller";

const streamRouter = Router();

streamRouter.post("/create", streamController.createStream);

streamRouter.get("/recommended", streamController.getRecommended);

streamRouter.get("/:id", streamController.getStreamInfo);

streamRouter.put("/:id/start", streamController.startStream);

streamRouter.delete("/:id/delete", streamController.deleteStream);

export default streamRouter;
