import { Router } from "express";
import { streamController } from "../controller";

const streamRouter = Router();

streamRouter.post("/create", streamController.createStream);

streamRouter.get("/:id", streamController.dummyfunc);

streamRouter.delete("/:id/delete", streamController.dummyfunc);

export default streamRouter;
