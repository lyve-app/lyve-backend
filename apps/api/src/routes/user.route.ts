import { Router } from "express";
import { userController } from "../controller";

const userRouter = Router();

userRouter.post("/follow", userController.followUser);

userRouter.post("/create", userController.createUser);

userRouter.get("/:id", userController.getUserInfo);

export default userRouter;
