import express from "express";
import {searchProducts, getTrendingSearchesController, recordSearchTermController} from "../controllers/searchController.js";

const searchRouter = express.Router();

function asyncHandler(fn: any) {
  return function (req: any, res: any, next: any) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

searchRouter.get("/search", asyncHandler(searchProducts));
searchRouter.get("/search/trending", asyncHandler(getTrendingSearchesController));
searchRouter.post("/search/record", asyncHandler(recordSearchTermController));

export default searchRouter;