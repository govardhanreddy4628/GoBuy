import { Request, Response } from "express";
import mongoose from "mongoose";
import ProductModel from "../models/productModel.js";
import { z } from "zod";
import { moderateComment } from "../utils/moderation.js";
import { ReviewModel } from "../models/reviewsModel.js";
import orderModel from "../models/orderModel.js";
import cloudinary from "../config/cloudinary.js";
import { getIO } from "../sockets/index.js";

// --- Zod validation schema for adding/updating review ---

const ReviewValidationSchema = z.object({
  productId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid product ID"),
  rating: z.preprocess((val) => Number(val), z.number().min(1).max(5)),
  title: z.string().max(100).optional(),
  comment: z.string().min(5),
  media: z.array(z.string().url()).optional(),
});

// --- Update Product rating aggregation ---
const updateProductRating = async (productId: string) => {
  const agg = await ReviewModel.aggregate([
    {
      $match: {
        product: new mongoose.Types.ObjectId(productId),
        status: "approved",
      },
    },
    {
      $group: {
        _id: "$product",
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ]);
  await ProductModel.findByIdAndUpdate(productId, {
    rating: agg[0]?.averageRating || 0,
    recentQuantity: agg[0]?.totalReviews || 0,
  });
};

export const getProductReviews = async (req: Request, res: Response) => {
  try {
    const { productId } = req.query;
    const { page = 1, limit = 10, sortBy = "recent" } = req.query;

    if (!productId)
      return res.status(400).json({ error: "Product ID required" });

    const skip = (+page - 1) * +limit;

    let sortStage: any = { createdAt: -1 };

    if (sortBy === "helpful") {
      sortStage = {
        helpfulScore: -1,
      };
    }

    const reviews = await ReviewModel.aggregate([
      {
        $match: {
          product: new mongoose.Types.ObjectId(productId as string),
          status: "approved",
        },
      },

      // 🔥 JOIN USER
      {
        $lookup: {
          from: "users", // collection name
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },

      // 🧠 AI Helpful Score
      {
        $addFields: {
          helpfulScore: {
            $add: [
              { $multiply: ["$upvotes", 2] },
              { $multiply: ["$downvotes", -1] },
              {
                $cond: ["$verifiedPurchase", 5, 0],
              },
              {
                $divide: [
                  {
                    $subtract: [new Date(), "$createdAt"],
                  },
                  1000 * 60 * 60 * 24,
                ],
              },
            ],
          },
        },
      },

      // ✅ SEND CLEAN DATA TO FRONTEND
      {
        $project: {
          _id: 1,
          rating: 1,
          comment: 1,
          media: 1,
          upvotes: 1,
          downvotes: 1,
          verifiedPurchase: 1,
          createdAt: 1,
          "user.name": 1,
          "user.avatar": 1,
        },
      },

      { $sort: sortStage },
      { $skip: skip },
      { $limit: +limit },
    ]);

    // 📊 Rating stats
    const stats = await ReviewModel.aggregate([
      {
        $match: {
          product: new mongoose.Types.ObjectId(productId as string),
          status: "approved",
        },
      },
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 },
        },
      },
    ]);

    const totalReviews = stats.reduce((acc, s) => acc + s.count, 0);

    const averageRating =
      stats.reduce((acc, s) => acc + s._id * s.count, 0) / (totalReviews || 1);

    res.json({
      success: true,
      reviews,
      stats: {
        averageRating,
        totalReviews,
        breakdown: stats,
      },
      hasMore: reviews.length === +limit, // ⚡ for infinite scroll
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// --- Add a review ---
export const addReview = async (req: Request, res: Response) => {
  try {
    const validated = ReviewValidationSchema.parse(req.body);

    const userId = req.user?.id; // ✅ from auth middleware
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    // 1️⃣ Prevent duplicate reviews by same user
    const existing = await ReviewModel.findOne({
      product: validated.productId,
      user: userId,
    });
    if (existing)
      return res
        .status(400)
        .json({ error: "User has already reviewed this product" });

    // ✅ Check purchase (REAL)
    const hasPurchased = await orderModel.exists({
      user: userId,
      "items.product": validated.productId,
      status: "delivered",
    });
    const verifiedPurchase = !!hasPurchased;

     // ✅ Upload images to Cloudinary
    let mediaUrls: string[] = [];
    // ✅ Handle media (multer)
    const files = req.files as Express.Multer.File[];
    if (files && files.length > 0) {
      const uploads = await Promise.all(
        files.map((file) =>
          cloudinary.uploader.upload(file.path, {
            folder: "reviews",
          })
        )
      );

      mediaUrls = uploads.map((img) => img.secure_url);
    }

    // 2️⃣ Count previous reviews for spam heuristic
    const userPreviousCount = await ReviewModel.countDocuments({
      user: userId,
      createdAt: { $gte: new Date(Date.now() - 1000 * 60 * 60 * 24) },
    });

    // 3️⃣ Moderate comment
    const { ok, reason } = moderateComment(validated.comment, {
      userPreviousCount,
    });

    // 4️⃣ Decide status based on moderation
    let status: "pending" | "approved" | "rejected" = "approved"; // default

    if (!ok) {
      // If rejected for strong profanity → reject
      if (reason === "contains_profanity") {
        status = "rejected";
      } else {
        // For mild spam or suspicious — send to admin
        status = "pending";
      }
    } else {
      // Optionally: randomly send 5–10% of clean reviews for audit
      if (Math.random() < 0.05) {
        status = "pending"; // 5% random sample for admin check
      }
    }

    // ✅ Create review
    const review = await ReviewModel.create({
      product: validated.productId,
      user: userId,
      rating: validated.rating,
      title: validated.title,
      comment: validated.comment,
      media: mediaUrls, // ✅ FIXED (not images)
      verifiedPurchase,
      status,
    });

    // 7️⃣ Update rating immediately only if approved
    if (status === "approved") {
      await updateProductRating(validated.productId);
    }

     // 🔥 IMPORTANT: populate user before sending
    const populatedReview = await review.populate("user", "name avatar");

    // 🔥 SOCKET EMIT (CORRECT)
    const io = getIO();
    io.to(validated.productId.toString()).emit(
      "new-review",
      populatedReview
    );

    // 8️⃣ Response message
    return res.status(201).json({
      message:
        status === "approved"
          ? "Your review has been posted successfully!"
          : status === "pending"
            ? "Your review is under moderation and will be visible soon."
            : "Your review was rejected.",
      review,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.errors || err.message });
  }
};


export const voteReview = async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params;
    const { vote } = req.body; // "up" | "down"
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    if (!["up", "down"].includes(vote)) {
      return res.status(400).json({ error: "Invalid vote type" });
    }

    const review = await ReviewModel.findById(reviewId);
    if (!review) return res.status(404).json({ error: "Review not found" });

    // 🔥 Find existing vote
    const existingVote = review.votedUsers.find(
      (v) => v.userId.toString() === userId
    );

    if (existingVote) {
      // ❌ Same vote again → block
      if (existingVote.vote === vote) {
        return res.status(400).json({ error: "Already voted" });
      }

      // 🔁 Switch vote
      if (vote === "up") {
        review.upvotes += 1;
        review.downvotes -= 1;
      } else {
        review.downvotes += 1;
        review.upvotes -= 1;
      }

      existingVote.vote = vote;
    } else {
      // ✅ New vote
      if (vote === "up") review.upvotes += 1;
      else review.downvotes += 1;

      review.votedUsers.push({
        userId: new mongoose.Types.ObjectId(userId),
        vote,
      });
    }

    // 🛑 Safety (avoid negative values)
    review.upvotes = Math.max(0, review.upvotes);
    review.downvotes = Math.max(0, review.downvotes);

    await review.save();

    // ⚡ Realtime update
    const io = getIO();
    io.to(review.product.toString()).emit("review-vote-update", {
      reviewId: review._id,
      upvotes: review.upvotes,
      downvotes: review.downvotes,
    });

    res.json({
      success: true,
      upvotes: review.upvotes,
      downvotes: review.downvotes,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// --- Update a review ---
export const updateReview = async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params;
    const validated = ReviewValidationSchema.partial().parse(req.body);

    const review = await ReviewModel.findByIdAndUpdate(reviewId, validated, {
      new: true,
    });
    if (!review) return res.status(404).json({ error: "Review not found" });

    await updateProductRating(review.product.toString());
    res.json(review);
  } catch (err: any) {
    res.status(400).json({ error: err.errors || err.message });
  }
};

// --- Delete a review ---
export const deleteReview = async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params;
    const review = await ReviewModel.findByIdAndDelete(reviewId);
    if (!review) return res.status(404).json({ error: "Review not found" });

    await updateProductRating(review.product.toString());
    res.json({ message: "Review deleted successfully" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// GET /api/admin/reviews/pending
export const getPendingReviews = async (req: Request, res: Response) => {
  try {
    const reviews = await ReviewModel.find({ status: "pending" })
      .populate("user", "name email")
      .populate("product", "name")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (err: unknown) {
    let message = "Something went wrong";
    if (err instanceof Error) message = err.message;

    res.status(500).json({ success: false, error: message });
  }
};

// PUT /api/admin/reviews/:id/moderate
export const moderateReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // "approve" or "reject"
    const adminId = req.user?.id; // assuming JWT auth middleware

    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({ error: "Invalid action" });
    }

    const review = await ReviewModel.findById(id);
    if (!review) return res.status(404).json({ error: "Review not found" });

    review.status = action === "approve" ? "approved" : "rejected";
    review.moderatedBy = adminId;
    review.moderatedAt = new Date();

    await review.save();

    // ✅ If approved, update product rating
    if (action === "approve") {
      const { product } = review;
      const agg = await ReviewModel.aggregate([
        {
          $match: {
            product: new mongoose.Types.ObjectId(product),
            status: "approved",
          },
        },
        {
          $group: {
            _id: "$product",
            averageRating: { $avg: "$rating" },
            totalReviews: { $sum: 1 },
          },
        },
      ]);

      await mongoose.model("Product").findByIdAndUpdate(product, {
        rating: agg[0]?.averageRating || 0,
        recentQuantity: agg[0]?.totalReviews || 0,
      });
    }

    res.json({
      success: true,
      message: `Review ${action}d successfully`,
      review,
    });
  } catch (err: unknown) {
    let message = "Something went wrong";
    if (err instanceof Error) message = err.message;

    res.status(500).json({ success: false, error: message });
  }
};

// GET /api/admin/reviews/stats
export const getReviewModerationStats = async (req: Request, res: Response) => {
  try {
    const [counts] = await ReviewModel.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
          approved: {
            $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] },
          },
          rejected: {
            $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] },
          },
        },
      },
    ]);

    res.json({
      success: true,
      stats: counts || { total: 0, pending: 0, approved: 0, rejected: 0 },
    });
  } catch (err: unknown) {
    let message = "Something went wrong";
    if (err instanceof Error) message = err.message;

    res.status(500).json({ success: false, error: message });
  }
};
