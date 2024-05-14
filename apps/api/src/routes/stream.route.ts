import { Router } from "express";
import { streamController } from "../controller";

const streamRouter = Router();

streamRouter.post("/create", streamController.createStream);

streamRouter.get("/:id", streamController.getStreamInfo);

streamRouter.delete("/:id/delete", streamController.deleteStream);

export default streamRouter;
