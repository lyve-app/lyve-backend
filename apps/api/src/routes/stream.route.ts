import { Router } from "express";
import { streamController } from "../controller";
import { upload } from "../middleware/upload";

const streamRouter = Router();

streamRouter.post(
  "/create",
  upload.single("image"),
  streamController.createStream
);

streamRouter.get("/:id", streamController.getStreamInfo);

streamRouter.put("/:id/start", streamController.startStream);

streamRouter.delete("/:id/delete", streamController.deleteStream);

export default streamRouter;
