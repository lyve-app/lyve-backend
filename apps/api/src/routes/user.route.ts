import { Router } from "express";
import { userController } from "../controller";

const userRouter = Router();

userRouter.post("/follow", userController.followUser);

userRouter.post("/unfollow", userController.unfollowUser);

userRouter.post("/create", userController.createUser);

userRouter.get("/:id", userController.getUserInfo);

userRouter.get("/:id/following", userController.following);

userRouter.get("/:id/followedBy", userController.followedBy);

userRouter.get("/:id/feed", userController.getFeed);

userRouter.get(
  "/:id/statistics/most-streamed-genre",
  userController.getMostStreamedGenres
);

userRouter.get("/:id/update", userController.updateUser);

export default userRouter;
