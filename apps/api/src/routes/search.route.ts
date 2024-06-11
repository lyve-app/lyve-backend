import { Router } from "express";
import { searchController } from "../controller";

const searchRouter = Router();

searchRouter.get("/", searchController.search);

export default searchRouter;
