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

userRouter.put("/:id/update", userController.updateUser);

userRouter.get(
  "/:id/statistics/most-streamed-genre",
  userController.getMostStreamedGenres
);

export default userRouter;
