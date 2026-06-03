import { Request, Response } from "express";
import ProductQA from "../models/prodQAModel.js";

// ✅ GET (with search + pagination)
export const getProductQAs = async (req: Request, res: Response) => {
  try {
    const { productId, page = 1, limit = 5, search = "" } = req.query;

    const query: any = {
      productId,
      question: { $regex: search, $options: "i" },
    };

    const qas = await ProductQA.find(query)
      .populate("askedBy", "name")
      .populate("answeredBy", "name")
      .sort({ answer: 1, createdAt: -1 }) // unanswered first
      .skip((+page - 1) * +limit)
      .limit(+limit);

    const total = await ProductQA.countDocuments(query);

    res.json({
      success: true,
      data: qas,
      total,
    });
  } catch {
    res.status(500).json({ success: false });
  }
};

// ✅ ASK QUESTION (LOGIN REQUIRED)
export const addQuestion = async (req: any, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Login required" });
    }

    const { productId, question } = req.body;

    const qa = await ProductQA.create({
      productId,
      question,
      askedBy: req.user._id,
    });

    res.json({ success: true, data: qa });
  } catch {
    res.status(500).json({ success: false });
  }
};

// ✅ ANSWER (ADMIN ONLY)
export const addAnswer = async (req: any, res: Response) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const { qaId, answer } = req.body;

    const qa = await ProductQA.findByIdAndUpdate(
      qaId,
      {
        answer,
        answeredBy: req.user._id,
      },
      { new: true }
    );

    res.json({ success: true, data: qa });
  } catch {
    res.status(500).json({ success: false });
  }
};

// ✅ HELPFUL (UPVOTE)
export const markHelpful = async (req: Request, res: Response) => {
  try {
    const { qaId } = req.body;

    const qa = await ProductQA.findByIdAndUpdate(
      qaId,
      { $inc: { helpfulCount: 1 } },
      { new: true }
    );

    res.json({ success: true, data: qa });
  } catch {
    res.status(500).json({ success: false });
  }
};