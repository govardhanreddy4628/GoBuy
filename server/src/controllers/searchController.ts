// controllers/searchController.ts
import searchAnalyticsModel from "../models/searchAnalyticsModel.js";
import { createEmbedding } from "../services/rag/embeddingService.js";
import { vectorSearchAggregationPipeline } from "../services/rag/vectorSearchService.js";
import productModel from "../models/productModel.js";
import CategoryModel from "../models/categoryModel.js";
import { Request, Response } from "express";
import { Types } from "mongoose";
import { getClosestMatch } from "../services/spellService.js";

// controllers/searchController.ts
export const recordSearchTermController = async (
  req: Request,
  res: Response,
) => {
  try {
    const term = (req.body.term as string)?.trim()?.toLowerCase();

    if (!term || term.length < 3) {
      return res.json({ success: false });
    }

    const regex = new RegExp(term, "i"); // FIXED

    let entityType: "product" | "category" | "brand" | null = null;
    let entityId: Types.ObjectId | null = null;

    // 🚀 Run both queries in parallel
    const productQuery = productModel
      .findOne({ name: regex })
      .select("_id")
      .lean<{ _id: Types.ObjectId } | null>();

    const categoryQuery = CategoryModel
      .findOne({ name: regex })
      .select("_id")
      .lean<{ _id: Types.ObjectId } | null>();

    const [product, category] = await Promise.all([productQuery, categoryQuery]);

    if (product) {
      entityType = "product";
      entityId = product._id;
    } else if (category) {
      entityType = "category";
      entityId = category._id;
    }


    // If term not in catalog → ignore
    if (!entityType) {
      return res.json({ success: false });
    }

    await searchAnalyticsModel.findOneAndUpdate(
      { term },
      {
        $inc: { count: 1 },
        $set: {
          entityType,
          entityId,
        },
      },
      { upsert: true },
    );

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getTrendingSearchesController = async (
  req: Request,
  res: Response,
) => {
  try {
    const trending = await searchAnalyticsModel
  .find({ term: { $exists: true, $ne: "" } })
  .sort({ count: -1 })
  .limit(8)
  .lean();

    const formatted = trending.map((t) => ({
      label: t.term,
      value: t.term,
      type: t.entityType || "product",
      id: t.entityId,
    }));

    res.json({
      success: true,
      data: formatted,
    });
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const searchProducts = async (req: Request, res: Response) => {
  try {
    const query = (req.query.q as string)?.trim();

    if (!query || query.length < 1) {
      return res.json({
        data: {
          didYouMean: null,
          products: [],
          categories: [],
        },
      });
    }

    // TEXT SEARCH
    const regex = new RegExp(query, "i");

    const textProducts = await productModel
      .find({
        $or: [{ name: regex }, { brand: regex }],
      })
      .select("name brand price slug images")
      .limit(5)
      .lean();

    const formattedTextProducts = textProducts.map((p: any) => ({
      _id: p._id,
      name: p.name,
      brand: p.brand,
      price: p.price,
      image: p.images?.[0]?.url || null,
      slug: p.slug,
      type: "product",
    }));

    // CATEGORY SUGGESTIONS
    const categoriesRaw = await CategoryModel.find({ name: regex })
      .select("name slug")
      .limit(3)
      .lean();

    const categories = categoriesRaw.map((c: any) => ({
      _id: c._id,
      name: c.name,
      slug: c.slug,
      type: "category",
    }));

    // VECTOR SEARCH (only if needed)
    let semanticResults: any[] = [];

    try {
      if (formattedTextProducts.length < 3 && query.length > 3) {
        const embedding = await createEmbedding(query);

        if (embedding) {
          const vectorResults = await vectorSearchAggregationPipeline(productModel, embedding);

          semanticResults = vectorResults.map((p: any) => ({
            _id: p._id,
            name: p.name,
            brand: p.brand,
            price: p.price,
            image: p.images?.[0]?.url || null,
            slug: p.slug,
            type: "product",
          }));
        }
      }
    } catch (error) {
      console.error("Embedding failed:", error);
    }

    // MERGE + REMOVE DUPLICATES
    const map = new Map();

    [...formattedTextProducts, ...semanticResults].forEach((item: any) => {
      if (!map.has(item._id?.toString())) {
        map.set(item._id?.toString(), item);
      }
    });

    const products = Array.from(map.values()).slice(0, 8);

    // SPELL CORRECTION (only if no results)
    let suggestion: string | null = null;

    if (products.length === 0) {
      const productNames = await productModel
        .find()
        .limit(500)
        .select("name")
        .lean();

      const dictionary = productNames.map((p) => p.name);

      suggestion = getClosestMatch(query, dictionary);
    }

    // RESPONSE
    res.json({
      data: {
        didYouMean: suggestion,
        products,
        categories,
      },
    });
  } catch (error: any) {
    console.error("Search error:", error);

    res.status(500).json({
      message: "Search failed",
      error: error.message,
    });
  }
};
