import { Router } from "express";
import { userController } from "../controller";

const userRouter = Router();

userRouter.get("/:id", userController.getUserInfo);

userRouter.post("/create", userController.createUser);

export default userRouter;
