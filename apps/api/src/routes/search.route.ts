import { Router } from "express";
import { searchController } from "src/controller";

const searchRouter = Router();

searchRouter.get("/", searchController.search);

export default searchRouter;
