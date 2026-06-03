import express from "express";
import { getPendingReviews, moderateReview, getReviewModerationStats } from "../controllers/reviewController.js";
//import { adminAuth } from "../middleware/adminAuth.js"; // restrict to admins
import { getProductReviews, voteReview, addReview } from "../controllers/reviewController.js";
import { uploadMultipleMedia } from "../middleware/multer.js";
import { authenticate } from "../middleware/authenticate.js";

const reviewsRouter = express.Router();

function asyncHandler(fn: any) {
  return function (req: any, res: any, next: any) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// reviewsRouter.get("/reviews/pending", adminAuth, getPendingReviews);
// reviewsRouter.put("/reviews/:id/moderate", adminAuth, moderateReview);
// reviewsRouter.get("/reviews/stats", adminAuth, getReviewModerationStats);

reviewsRouter.get("/reviews/pending", getPendingReviews);
//reviewsRouter.put("/reviews/:id/moderate", moderateReview);
reviewsRouter.get("/reviews/stats", getReviewModerationStats);

reviewsRouter.get("/", asyncHandler(getProductReviews));
reviewsRouter.post("/add", authenticate(), uploadMultipleMedia, asyncHandler(addReview));
reviewsRouter.put("/:id/vote", authenticate(), asyncHandler(voteReview));

export default reviewsRouter;
