import { Router } from "express";
import { streamController } from "../controller";

const streamRouter = Router();

streamRouter.get("/:id", streamController.getStreamInfo);

streamRouter.post("/create", streamController.createStream);

streamRouter.put("/:id/start", streamController.activateStream);

streamRouter.get("/recommended", streamController.getRecommended);

streamRouter.delete("/:id/delete", streamController.deleteStream);

export default streamRouter;
