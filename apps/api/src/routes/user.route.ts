import { Router } from "express";
import { userController } from "../controller";

const userRouter = Router();

userRouter.post("/follow", userController.followUser);

userRouter.post("/create", userController.createUser);

userRouter.get("/:id", userController.getUserInfo);

userRouter.get("/:id/following", userController.following);

userRouter.get("/:id/followedBy", userController.followedBy);

export default userRouter;
