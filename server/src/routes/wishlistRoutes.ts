import { Router } from "express";

import { getWishlistController, toggleWishlistController } from "../controllers/wishlistController.js";
// import {
//   addToWishlistController, getWishlistItemsController,
//   deleteWishlistItemController, updateWishlistItemController,
// } from "../controllers/wishlistController.js";
import { authenticate } from "../middleware/authenticate.js";


const wishlistRouter = Router();

// Helper to wrap async controllers and forward errors
const asyncHandler = (fn: any) => (req: any, res: any, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// wishlistRouter.post("/add", asyncHandler(addToWishlistController));

// wishlistRouter.get(
//   "/getWishlist",
//   authenticate(),
//   asyncHandler(getWishlistItemsController)
// );
// wishlistRouter.delete(
//   "/deleteWishlistItem/:id",
//   authenticate(),
//   asyncHandler(deleteWishlistItemController)
// );
// wishlistRouter.put(
//   "/updateWishlistItem/:id",
//   authenticate(),
//   asyncHandler(updateWishlistItemController)
// );


wishlistRouter.get("/", authenticate(), asyncHandler(getWishlistController));
wishlistRouter.post("/toggle", authenticate(), asyncHandler(toggleWishlistController));


export default wishlistRouter;
