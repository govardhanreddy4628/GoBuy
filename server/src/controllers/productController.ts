import { NextFunction, Request, Response } from "express";
import productModel from "../models/productModel.js";
import { z } from "zod";
import cloudinary from "../config/cloudinary.js";
import mongoose from "mongoose";
import { Types } from "mongoose";
import couponModel from "../models/couponModel.js";
import { inngest } from "../inngest/client.js"; // optional: only if you’re using inngest
import { getCategoryBreadcrumb } from "../services/getBreadCrumb.js";
import CategoryModel from "../models/categoryModel.js";
import searchAnalytics from "../models/searchAnalyticsModel.js";
import UserModel from "../models/userModel.js";

//  or use following validation
//     const querySchema = z.object({
//   page: z.coerce.number().min(1).optional(),
//   perPage: z.coerce.number().min(1).optional()
// });

// const result = querySchema.safeParse(req.query);
// if (!result.success) {
//   return res.status(400).json({ error: result.error.format() });
// }
// const { page = 1, perPage = 10 } = result.data;

async function validateProductCategory(categoryId: mongoose.Types.ObjectId) {
  const category = (await CategoryModel.findById(categoryId).lean()) as {
    isActive?: boolean;
    children?: any[];
  } | null;

  if (!category) {
    throw new Error("Category does not exist");
  }

  if (!category.isActive) {
    throw new Error("Category is inactive");
  }

  if (category.children && category.children.length > 0) {
    throw new Error("Product must be assigned to a leaf category");
  }

  return category;
}

export const createProductController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const allowedFields = [
      "name",
      "price",
      "category",
      "discountPercentage",
      "quantity",
      "description",
      "images",
    ];

    //Sanitize input
    const filteredBody: Record<string, any> = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        filteredBody[field] = req.body[field];
      }
    }

    // ✅ Category validation
    if (!filteredBody.category) {
      res.status(400).json({ message: "Category is required" });
    }
    const categoryId = new Types.ObjectId(filteredBody.category);
    await validateProductCategory(categoryId);
    filteredBody.category = categoryId;

    // ✅ Price validation
    filteredBody.price = Number(filteredBody.price);
    if (
      isNaN(filteredBody.price) ||
      filteredBody.price <= 0 ||
      filteredBody.price > 100000
    ) {
      throw new Error("Invalid price");
    }

    // Handle optional discount
    const discountPercentage = Number(filteredBody.discountPercentage ?? 0);
    if (
      isNaN(discountPercentage) ||
      discountPercentage < 0 ||
      discountPercentage > 100
    ) {
      res.status(400).json({
        message: "Invalid discountPercentage: must be between 0 and 100",
        success: false,
        error: true,
      });
      return;
    }
    filteredBody.discountPercentage = discountPercentage;

    // Calculate discount price
    filteredBody.discountPrice = Math.round(
      filteredBody.price * (1 - discountPercentage / 100),
    );

    // Validate quantity
    const quantity = Number(filteredBody.quantity);
    if (isNaN(quantity) || quantity < 0) {
      res.status(400).json({
        message: "Quantity must be a non-negative number",
        success: false,
        error: true,
      });
      return;
    }
    filteredBody.quantity = quantity;

    // Create product
    const product = new productModel(filteredBody);
    const savedProduct = await product.save();

    res.status(201).json({
      message: "Product created successfully",
      success: true,
      error: false,
      data: savedProduct,
    });
  } catch (error) {
    next(error); // Delegates to centralized error handler
  }
};

/**
 * Create a new product (direct Cloudinary upload version)
 * - Frontend uploads images → Cloudinary "temp/products/"
 * - On submit, backend renames them to "products/"
 * - Saves product data + image metadata in DB
 */
export const createProduct = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    console.log("🟢 Incoming product body:", req.body);

    const {
      name,
      description,
      shortDescription,
      category,
      listedPrice,
      costPerItem,
      quantityInStock,
      brand,
      productColor,
      availableColorsForProduct,
      images: imagesFromClient,
    } = req.body;

    // ✅ Basic validation
    if (
      !name ||
      !description ||
      !shortDescription ||
      !category ||
      !listedPrice
    ) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    const finalPrice =
      req.body.finalPrice === undefined ? 0 : req.body.finalPrice;

    if (!Types.ObjectId.isValid(category)) {
      res.status(400).json({ message: "Invalid category ID format" });
      return;
    }

    if (finalPrice > listedPrice) {
      res
        .status(400)
        .json({ message: "Final price cannot be greater than listed price" });
      return;
    }

    if (finalPrice < 0 || listedPrice < 0) {
      res.status(400).json({ message: "Price cannot be negative" });
      return;
    }

    // ✅ Calculate discount percentage safely
    const discountPercentage =
      listedPrice > 0 && finalPrice < listedPrice
        ? Math.round(((listedPrice - finalPrice) / listedPrice) * 100)
        : 0;

    // 🖼️ Finalize Cloudinary images
    let finalImages: any[] = [];

    if (
      imagesFromClient &&
      Array.isArray(imagesFromClient) &&
      imagesFromClient.length > 0
    ) {
      const movedImages: any[] = [];

      for (const img of imagesFromClient) {
        const publicId = img.public_id || img.publicId;
        if (!publicId) continue;

        // If image still in temp folder → move it
        if (publicId.startsWith("temp/products/")) {
          const fileName = publicId.replace("temp/products/", "");
          const newPublicId = `products/${fileName}`;

          try {
            const renamed = await cloudinary.uploader.rename(
              publicId,
              newPublicId,
            );

            movedImages.push({
              public_id: renamed.public_id,
              url: renamed.secure_url,
              width: renamed.width,
              height: renamed.height,
              format: renamed.format,
              size: renamed.bytes,
              uploadedAt: new Date(),
              alt: img.alt || "",
              role: img.role || "gallery",
            });

            console.log(`✅ Moved image: ${publicId} → ${newPublicId}`);
          } catch (err: any) {
            console.error(
              `❌ Failed to move ${publicId} → ${newPublicId}:`,
              err,
            );
            res.status(500).json({
              message: `Error finalizing image ${publicId}`,
              error: err.message,
            });
            return;
          }
        } else {
          // Already permanent (e.g., user reuses existing image)
          movedImages.push({
            public_id: publicId,
            url: img.url || img.secure_url,
            width: img.width,
            height: img.height,
            format: img.format,
            size: img.size,
            uploadedAt: img.uploadedAt || new Date(),
            alt: img.alt || "",
            role: img.role || "gallery",
          });
        }
      }

      finalImages = movedImages;
    }

    if (!finalImages || finalImages.length === 0) {
      res.status(400).json({ message: "At least one image required" });
      return;
    }

    //Generate unique SKU
    let generatedSKU = "";
    const baseSKU = `${
      brand?.substring(0, 3)?.toUpperCase() || "GEN"
    }-${Date.now().toString().slice(-6)}`;
    let counter = 0;
    while (true) {
      const candidate = counter === 0 ? baseSKU : `${baseSKU}-${counter}`;
      const exists = await productModel.exists({ sku: candidate });
      if (!exists) {
        generatedSKU = candidate;
        break;
      }
      counter++;
    }

    let generatedBarcode = "";
    while (true) {
      const candidate = `${Math.floor(
        100000000000 + Math.random() * 900000000000,
      )}`; // 12-digit random number
      const exists = await productModel.exists({ barcode: candidate });
      if (!exists) {
        generatedBarcode = candidate;
        break;
      }
    }

    const newProduct = new productModel({
      name,
      description,
      shortDescription,
      category,
      brand,
      productColor: productColor || undefined,
      availableColorsForProduct: availableColorsForProduct || [],
      images: finalImages,
      listedPrice,
      finalPrice,
      discountPercentage: discountPercentage || 0,
      costPerItem,
      quantityInStock,
      sku: generatedSKU,
      barcode: generatedBarcode,
    });

    await newProduct.save();

    // (Optional) Post-processing event
    try {
      await inngest.send({
        name: "product/created",
        data: {
          productId: newProduct._id,
          userId: (req as any).user?._id || null,
          images: finalImages,
        },
      });
    } catch {
      console.warn("⚠️ Skipping inngest event (not configured).");
    }

    console.log("✅ Product created successfully:", newProduct._id);

    res.status(201).json({
      success: true,
      error: false,
      message: "Product created successfully",
      product: newProduct,
    });
  } catch (error: any) {
    console.error("💥 Error in createProduct:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateProductController = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const { id } = req.params;

  try {
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    // 1️⃣ Load existing product
    const product = await productModel.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const incomingImages = req.body.images || [];
    const existingImages = product.images || [];

    // 2️⃣ Build ID sets
    const existingIds = new Set(
      existingImages.map((img: any) => img.public_id),
    );
    const incomingIds = new Set(
      incomingImages.map((img: any) => img.public_id),
    );

    // 3️⃣ Find removed images (delete from Cloudinary)
    const removedImages = existingImages.filter(
      (img: any) => !incomingIds.has(img.public_id),
    );

    for (const img of removedImages) {
      try {
        await cloudinary.uploader.destroy(img.public_id);
        console.log("🗑️ Deleted image:", img.public_id);
      } catch (err) {
        console.error("❌ Failed to delete image:", img.public_id, err);
      }
    }

    // 4️⃣ Handle newly added images (temp → products)
    for (const img of incomingImages) {
      if (
        !existingIds.has(img.public_id) &&
        img.public_id.startsWith("temp/products/")
      ) {
        const fileName = img.public_id.replace("temp/products/", "");
        const newPublicId = `products/${fileName}`;

        const renamed = await cloudinary.uploader.rename(
          img.public_id,
          newPublicId,
        );

        img.public_id = renamed.public_id;
        img.url = renamed.secure_url;
      }
    }

    // 5️⃣ Update other fields
    product.name = req.body.name ?? product.name;
    product.description = req.body.description ?? product.description;
    product.shortDescription =
      req.body.shortDescription ?? product.shortDescription;
    if (req.body.category) {
      if (!Types.ObjectId.isValid(req.body.category)) {
        return res.status(400).json({
          success: false,
          message: "Invalid category ID",
        });
      }
      product.category = req.body.category;
    }
    product.brand = req.body.brand ?? product.brand;
    product.listedPrice = req.body.listedPrice ?? product.listedPrice;
    product.finalPrice = req.body.finalPrice ?? product.finalPrice;
    product.costPerItem = req.body.costPerItem ?? product.costPerItem;
    product.quantityInStock =
      req.body.quantityInStock ?? product.quantityInStock;

    // ✅ optional single color
    product.productColor =
      req.body.productColor !== undefined
        ? req.body.productColor
        : product.productColor;

    // ✅ optional color array
    product.availableColorsForProduct =
      req.body.availableColorsForProduct ?? product.availableColorsForProduct;

    // 6️⃣ Replace images array
    product.images = incomingImages;

    // ✅ Price update logic
    const listedPrice = req.body.listedPrice ?? product.listedPrice;

    const finalPrice =
      req.body.finalPrice === undefined
        ? (product.finalPrice ?? 0)
        : req.body.finalPrice;

    if (finalPrice > listedPrice) {
      return res.status(400).json({
        success: false,
        message: "Final price cannot be greater than listed price",
      });
    }

    product.listedPrice = listedPrice;
    product.finalPrice = finalPrice;

    product.discountPercentage =
      listedPrice > 0 && finalPrice < listedPrice
        ? Math.round(((listedPrice - finalPrice) / listedPrice) * 100)
        : 0;

    const updatedProduct = await product.save();

    return res.status(200).json({
      success: true,
      data: updatedProduct,
    });
  } catch (err) {
    console.error("Error updating product:", err);

    const message = err instanceof Error ? err.message : "Unknown server error";

    return res.status(500).json({
      success: false,
      message,
    });
  }
};

export const getAllProductController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    let {
      page = "1",
      limit = "10",
      search,
      category,
      status,
      stock,
      sort,
    } = req.query;

    /* ---------------- Pagination ---------------- */
    const pageNumber = Math.max(parseInt(page as string, 10) || 1, 1);
    const limitNumber = Math.min(parseInt(limit as string, 10) || 10, 100);
    const skip = (pageNumber - 1) * limitNumber;

    /* ---------------- Match Query ---------------- */
    const matchQuery: any = {};

    /* 🔍 Search */
    if (typeof search === "string" && search.trim()) {
      const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      matchQuery.$or = [
        { name: { $regex: safeSearch, $options: "i" } },
        { shortDescription: { $regex: safeSearch, $options: "i" } },
      ];
    }

    /* 📂 Category (by ID) */
    if (typeof category === "string" && category.trim()) {
      if (mongoose.Types.ObjectId.isValid(category)) {
        matchQuery.category = new mongoose.Types.ObjectId(category);
      }
    }

    /* ✅ Status */
    if (
      typeof status === "string" &&
      status.trim() &&
      ["active", "inactive", "discontinued", "archived"].includes(status)
    ) {
      matchQuery.status = status;
    }

    /* 📦 Stock */
    if (stock === "out") matchQuery.quantityInStock = 0;
    if (stock === "in") matchQuery.quantityInStock = { $gt: 0 };
    if (stock === "low") matchQuery.quantityInStock = { $lte: 10 };

    /* 🔢 Sorting */
    const ALLOWED_SORT_FIELDS = ["createdAt", "price", "name"];
    const sortQuery: Record<string, 1 | -1> = {};

    if (typeof sort === "string") {
      sort.split(",").forEach((s) => {
        const [key, order] = s.split(":");
        if (ALLOWED_SORT_FIELDS.includes(key)) {
          sortQuery[key] = order === "desc" ? -1 : 1;
        }
      });
    }

    if (!Object.keys(sortQuery).length) {
      sortQuery.createdAt = -1;
    }

    ////   (or)
    // let sortQuery: any = { createdAt: -1 };
    // if (sort === "price_asc") sortQuery = { price: 1 };
    // if (sort === "price_desc") sortQuery = { price: -1 };
    // if (sort === "newest") sortQuery = { createdAt: -1 };
    // if (sort === "oldest") sortQuery = { createdAt: 1 };

    /* ---------------- Count (BEFORE pagination) ---------------- */
    const total = await productModel.countDocuments(matchQuery);
    const totalPages = Math.ceil(total / limitNumber);

    if (pageNumber > totalPages && totalPages > 0) {
      return res.status(404).json({
        success: false,
        message: "Page not found",
      });
    }

    /* ---------------- Aggregation ---------------- */
    const products = await productModel.aggregate([
      /* 1️⃣ Filters */
      { $match: matchQuery },

      /* 2️⃣ Extract ONLY thumbnail */
      {
        $addFields: {
          images: {
            $filter: {
              input: "$images",
              as: "img",
              cond: { $eq: ["$$img.role", "thumbnail"] },
            },
          },
        },
      },

      /* 3️⃣ Join category */
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: {
          path: "$category",
          preserveNullAndEmptyArrays: true,
        },
      },

      /* 4️⃣ Sorting */
      { $sort: sortQuery },

      /* 5️⃣ Pagination */
      { $skip: skip },
      { $limit: limitNumber },

      /* 6️⃣ ✅ FINAL PROJECTION (THIS FIXES YOUR ISSUE) */
      {
        $project: {
          _id: 1,
          name: 1,
          shortDescription: 1,
          finalPrice: 1,
          brand: 1,
          isFeatured: 1,
          quantityInStock: 1,
          rating: 1,
          status: 1,
          slug: 1,
          createdAt: 1,

          category: {
            _id: 1,
            name: 1,
            slug: 1,
          },

          images: 1,

          // // ❌ explicitly drop heavy fields
          // description: 0,
          // specifications: 0,
          // seoTags: 0,
          // reviews: 0,
          // imageAudit: 0,
          // embeddedOffers: 0,
        },
      },
    ]);

    /* ---------------- Response ---------------- */
    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single product details by ID (specifically for Men's category)
 * @route   GET /api/v1/men/products/:productId
 * @access  Public
 */
export const getProductByIdandCategory = async (
  req: Request,
  res: Response,
) => {
  try {
    // 1. Extract the product ID from the URL parameters
    const productId = req.params.productId;

    // 2. Input Validation (optional but recommended)
    // If using Mongoose, you can check if the ID format is valid
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format.",
      });
    }

    // 3. Query the database for the product
    // We add an extra check: ensure the category is 'men'
    const product = await productModel
      .findOne({
        _id: productId,
        category: "men", // Ensures only products categorized as 'men' are returned
      })
      .select("-__v"); // Exclude the version key from the response

    // 4. Handle Product Not Found
    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Men's product with ID ${productId} not found.`,
      });
    }

    const breadcrumb = await getCategoryBreadcrumb(product.category.toString());

    // 5. Successful Response
    res.status(200).json({
      success: true,
      data: {
        product,
        breadcrumb,
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(
        `Error fetching product ID ${req.params.productId}:`,
        error.message,
      );
      res.status(500).json({
        success: false,
        message: "A server error occurred while fetching the product.",
      });
    } else {
      console.error("Unknown error:", error);
      res.status(500).json({
        success: false,
        message: "An unexpected error occurred.",
      });
    }
  }
};

/**
 * @desc    Get single product details by ID
 * @route   GET /api/v1/products/:productId
 * @access  Public
 */
export const getProductById = async (req: Request, res: Response) => {
  try {
    // 1. Extract the product ID from the URL parameters
    const productId = req.params.productId;

    // 2. Input Validation (optional but recommended)
    // If using Mongoose, you can check if the ID format is valid
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format.",
      });
    }

    // 3. Query the database for the product
    // We add an extra check: ensure the category is 'men'
    const product = await productModel
      .findOne({
        _id: productId,
      })
      .select("-__v"); // Exclude the version key from the response

    // 4. Handle Product Not Found
    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Men's product with ID ${productId} not found.`,
      });
    }

    const breadcrumb = await getCategoryBreadcrumb(product.category.toString());

    // 5. Successful Response
    res.status(200).json({
      success: true,
      data: {
        product,
        breadcrumb,
      },
    });
  } catch (error: unknown) {
    // ✅ Narrow the type safely
    if (error instanceof Error) {
      console.error(
        `Error fetching product ID ${req.params.productId}:`,
        error.message,
      );
      res.status(500).json({
        success: false,
        message: "A server error occurred while fetching the product.",
      });
    } else {
      console.error("Unknown error:", error);
      res.status(500).json({
        success: false,
        message: "An unexpected server error occurred.",
      });
    }
  }
};

export const getAllProductByCatIdController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const catId = req.params.id;

    // Validate catId
    if (!catId) {
      res.status(400).json({
        message: "Category ID is required",
        success: false,
        error: true,
      });
      return;
    }

    // Validate pagination
    const page = Number(req.query.page) || 1;
    const perPage = Number(req.query.perPage) || 10000;

    if (
      !Number.isInteger(page) ||
      !Number.isInteger(perPage) ||
      page <= 0 ||
      perPage <= 0
    ) {
      res.status(400).json({
        message: "page and perPage must be positive integers",
        success: false,
        error: true,
      });
    }

    const search = (req.query.search as string) || "";
    const sortBy = (req.query.sortBy as string) || "createdAt"; // default sort field
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1; // default: descending
    const inStockFilter =
      req.query.inStock === "true"
        ? true
        : req.query.inStock === "false"
          ? false
          : null;

    // ---------------------------------------------------
    // STEP 1: Find child categories
    // ---------------------------------------------------

    const childCategories = await CategoryModel.find({
      parentCategory: catId,
    }).select("_id");

    const categoryIds = [catId, ...childCategories.map((cat) => cat._id)];

    // ---------------------------------------------------
    // STEP 2: Build filter
    // ---------------------------------------------------

    const filter: any = {
      catId: { $in: categoryIds },
    };

    if (search) {
      filter.name = { $regex: search, $options: "i" }; // case-insensitive search
    }

    if (inStockFilter !== null) {
      filter.inStock = inStockFilter;
    }

    // Only count products in the requested category
    const totalProducts = await productModel.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / perPage);

    // Prevent 404 if DB is empty
    if (page > totalPages && totalPages > 0) {
      res.status(404).json({
        message: "Page not found",
        success: false,
        error: true,
      });
      return;
    }

    // Fetch paginated products for the category
    const products = await productModel
      .find(filter)
      .populate("category")
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * perPage)
      .limit(perPage);

    res.status(200).json({
      success: true,
      error: false,
      data: products,
      pagination: {
        currentPage: page,
        perPage,
        totalProducts,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching products by category:", error);
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    res.status(500).json({ success: false, error: message });
  }
};

// Utility to extract and constrain pagination parameters
const getPaginationParams = (req: Request) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const perPage = Math.min(
    100,
    Math.max(1, parseInt(req.query.perPage as string) || 10),
  );
  return { page, perPage };
};

// Consistent error response utility
const sendErrorResponse = (
  res: Response,
  status = 500,
  message = "An error occurred",
) => {
  return res.status(status).json({
    success: false,
    error: true,
    message,
  });
};

//ok
export const getAllProductByCatNameController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void | Response> => {
  try {
    const { page, perPage } = getPaginationParams(req);
    const { catName } = req.params;

    if (!catName) {
      return sendErrorResponse(res, 400, "Missing category name");
    }

    const filter = { catName };
    const totalProducts = await productModel.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / perPage);

    if (page > totalPages && totalPages > 0) {
      return sendErrorResponse(res, 404, "Page not found");
    }

    const products = await productModel
      .find(filter)
      .populate("category")
      .skip((page - 1) * perPage)
      .limit(perPage);

    res.status(200).json({
      success: true,
      error: false,
      data: products,
      pagination: {
        totalProducts,
        totalPages,
        currentPage: page,
        perPage,
      },
    });
  } catch (error) {
    console.error("Error in getAllProductByCatNameController:", error);
    const message =
      error instanceof Error ? error.message : "Unknown server error";
    sendErrorResponse(res, 500, message);
  }
};

//============================get products by rating=====================

// export const getAllProductByRating = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void | any> => {
//   try {

//     const page = parseInt(req.query.page) || 1;
//     const perPage = parseInt(req.query.perPage) || 10000;

//     const totalPosts = await productModel.countDocuments();
//     const totalPages = Math.ceil(totalPosts / perPage);

//     if(page > totalPages) {
//       return res.status(404).json({
//         message:"page not found",
//         success: false,
//         error: true
//       })
//     }

//     let products = [];

//     if(req.query.catId !== undefined) {
//       products = await productModel.find({
//       rating:req.query.rating,
//       catId:req.query.catId,

//     }) .populate("category")
//     .skip((page - 1) * perPage)
//     .limit(perPage)
//     .exec();
//     }

//     if (!products) {
//       return res.status(500).json({ success: false });
//     }
//     res.status(200).json({
//       error:false,
//       success: true,
//       data: products,
//       totalPages: totalPages,
//       page: page,
//     });
//   } catch (error) {
//     if (error instanceof Error) {
//       res.status(500).json({ success: false, error: error.message });
//     } else {
//     res.status(500).json({ success: false, error: "Unknown error occurred" });
//     }
//     console.log(error);
//   }
// };

// export const getAllProductByRating = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   try {
//     const page = Math.max(parseInt(req.query.page as string) || 1, 1);
//     const perPage = Math.min(parseInt(req.query.perPage as string) || 20, 100);

//     const rating = parseFloat(req.query.rating as string);
//     if (isNaN(rating)) {
//       return res.status(400).json({
//         success: false,
//         error: true,
//         message: 'Invalid or missing "rating" query parameter',
//       });
//     }

//     // Build dynamic filter
//     const filter: any = { rating };

//     if (req.query.catId) filter.catId = req.query.catId;
//     if (req.query.subCategoryId) filter.subCategoryId = req.query.subCategoryId;
//     if (req.query.thirdSubCategoryId) filter.thirdSubCategoryId = req.query.thirdSubCategoryId;

//     const totalProducts = await productModel.countDocuments(filter);
//     const totalPages = Math.ceil(totalProducts / perPage);

//     if (page > totalPages && totalProducts > 0) {
//       return res.status(404).json({
//         success: false,
//         error: true,
//         message: 'Page not found',
//       });
//     }

//     const products = await productModel
//       .find(filter)
//       .populate('category')
//       .skip((page - 1) * perPage)
//       .limit(perPage)
//       .lean();

//     return res.status(200).json({
//       success: true,
//       error: false,
//       data: products,
//       pagination: {
//         page,
//         perPage,
//         totalItems: totalProducts,
//         totalPages,
//       },
//     });

//   } catch (error) {
//     console.error('Error fetching products by rating:', error);
//     return res.status(500).json({
//       success: false,
//       error: true,
//       message: error instanceof Error ? error.message : 'Internal server error',
//     });
//   }
// };

// Zod schema for validation

// const ratingQuerySchema = z.object({
//   page: z
//     .string()
//     .optional()
//     .transform((val) => parseInt(val || "1"))
//     .refine((val) => val > 0, { message: "Page must be positive" }),
//   perPage: z
//     .string()
//     .optional()
//     .transform((val) => parseInt(val || "20"))
//     .refine((val) => val > 0 && val <= 100, {
//       message: "perPage must be between 1 and 100",
//     }),
//   rating: z
//     .string()
//     .optional()
//     .transform(Number)
//     .refine((val) => !isNaN(val), { message: "Rating must be a number" }),
//   minRating: z
//     .string()
//     .optional()
//     .transform(Number)
//     .refine((val) => !isNaN(val), { message: "minRating must be a number" }),
//   maxRating: z
//     .string()
//     .optional()
//     .transform(Number)
//     .refine((val) => !isNaN(val), { message: "maxRating must be a number" }),
//   sort: z.enum(["asc", "desc"]).optional(),
//   catId: z.string().optional(),
//   subCategoryId: z.string().optional(),
//   thirdSubCategoryId: z.string().optional(),
// });

// export const getAllProductByRating = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void | Response> => {
//   try {
//     // ✅ Validate & parse query
//     const parsed = ratingQuerySchema.safeParse(req.query);

//     if (!parsed.success) {
//       return res.status(400).json({
//         success: false,
//         error: true,
//         message: "Invalid query parameters",
//         issues: parsed.error.format(),
//       });
//     }

//     const {
//       page,
//       perPage,
//       rating,
//       minRating,
//       maxRating,
//       sort,
//       catId,
//       subCategoryId,
//       thirdSubCategoryId,
//     } = parsed.data;

//     // ✅ Build query filter
//     const filter: any = {};

//     if (typeof rating === "number") {
//       filter.rating = rating;
//     } else {
//       if (typeof minRating === "number" || typeof maxRating === "number") {
//         filter.rating = {};
//         if (typeof minRating === "number") filter.rating.$gte = minRating;
//         if (typeof maxRating === "number") filter.rating.$lte = maxRating;
//       }
//     }

//     if (catId) filter.catId = catId;
//     if (subCategoryId) filter.subCategoryId = subCategoryId;
//     if (thirdSubCategoryId) filter.thirdSubCategoryId = thirdSubCategoryId;

//     // ✅ Count documents with filter
//     const totalItems = await productModel.countDocuments(filter);
//     const totalPages = Math.ceil(totalItems / perPage);

//     if (page > totalPages && totalItems > 0) {
//       return res.status(404).json({
//         success: false,
//         error: true,
//         message: "Page not found",
//       });
//     }

//     // ✅ Sort logic
//     // ✅ FIX: Strongly typed sortOption
//     const sortOption: Record<string, 1 | -1> = sort
//       ? { rating: sort === "asc" ? 1 : -1 }
//       : {};

//     // ✅ Fetch data
//     const products = await productModel
//       .find(filter)
//       .populate("category")
//       .sort(sortOption)
//       .skip((page - 1) * perPage)
//       .limit(perPage)
//       .lean();

//     return res.status(200).json({
//       success: true,
//       error: false,
//       data: products,
//       pagination: {
//         totalItems,
//         totalPages,
//         page,
//         perPage,
//       },
//     });
//   } catch (error) {
//     console.error("getAllProductByRating error:", error);
//     return res.status(500).json({
//       success: false,
//       error: true,
//       message: error instanceof Error ? error.message : "Internal server error",
//     });
//   }
// };

//ok
export async function getProductsCount(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    // Optional: future filter support (e.g., only active products)
    const filter: any = {}; // e.g., { isActive: true }

    const productsCount = await productModel.countDocuments(filter);

    res.status(200).json({
      success: true,
      error: false,
      data: {
        count: productsCount,
      },
    });
  } catch (error) {
    console.error("Error fetching product count:", error);
    res.status(500).json({
      success: false,
      error: true,
      message: error instanceof Error ? error.message : "Internal server error",
    });
  }
}

//ok
export const getAllFeaturedProductsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const pageParam = req.query.page;
    const limitParam = req.query.limit;

    // If either page or limit is missing, fetch all products without pagination
    if (typeof pageParam === "undefined" || typeof limitParam === "undefined") {
      const allProducts = await productModel
        .find({ isFeatured: true })
        .populate("category")
        .lean();
      res.status(200).json({
        success: true,
        error: false,
        data: allProducts,
        pagination: null,
      });
    }

    const page = Math.max(parseInt(pageParam as string), 1);
    const limit = Math.min(parseInt(limitParam as string), 100);
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      productModel
        .find({ isFeatured: true })
        .populate("category")
        .skip(skip)
        .limit(limit)
        .lean(),
      productModel.countDocuments({ isFeatured: true }),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      error: false,
      data: products,
      pagination: {
        totalItems: total,
        totalPages,
        currentPage: page,
        perPage: limit,
      },
    });
  } catch (error) {
    console.error("Error fetching featured products:", error);
    res.status(500).json({
      success: false,
      error: true,
      message: error instanceof Error ? error.message : "Internal server error",
    });
  }
};

//ok
export const getSingleProductByIdController = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const { id } = req.params;

  // ✅ Validate MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      error: true,
      message: "Invalid product ID format",
    });
  }

  try {
    const product = await productModel
      .findById(id)
      .populate("category", "name _id") // ✅ Only populate necessary fields
      .lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        error: true,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      error: false,
      data: product,
    });
  } catch (err) {
    console.error(`Error fetching product by ID (${id}):`, err);
    return res.status(500).json({
      success: false,
      error: true,
      message: "Internal server error",
      details: err instanceof Error ? err.message : String(err),
    });
  }
};

//ok
export const deleteProductController = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const { id } = req.params;

  try {
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // 1️⃣ Find product
    const product = await productModel.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // 2️⃣ Delete product FIRST (DB is source of truth)
    await productModel.findByIdAndDelete(id);

    // 3️⃣ Delete Cloudinary images (best-effort, non-blocking)
    if (Array.isArray(product.images)) {
      for (const img of product.images) {
        const publicId = img?.public_id;

        if (!publicId) continue;

        try {
          await cloudinary.uploader.destroy(publicId);
          console.log("🗑️ Deleted image:", publicId);
        } catch (err) {
          console.warn("⚠️ Failed to delete Cloudinary image:", publicId, err);
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      data: product,
    });
  } catch (error) {
    console.error("💥 Error deleting product:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while deleting product",
    });
  }
};

//ok
// //DELETE image from cloudinary
// await axios.delete("/api/cloudinary/remove", {
//   params: { img: imageUrl },
// });
export async function removeImageFromCloudinary(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const imgUrl = req.query.img as string;
    const publicIdFromBody = req.body.public_id as string;

    let publicId: string | undefined;

    // Use public_id if provided
    if (publicIdFromBody) {
      publicId = publicIdFromBody;
    } else if (imgUrl) {
      // Extract public_id from URL
      const urlSegments = imgUrl.split("/");
      const filename = urlSegments[urlSegments.length - 1]; // e.g., 'image123.jpg'
      publicId = filename.split(".")[0]; // e.g., 'image123'
    }

    if (!publicId) {
      res.status(400).json({
        success: false,
        error: true,
        message: "Image URL or public_id is required",
      });
      return;
    }

    // Delete image from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === "ok") {
      res.status(200).json({
        success: true,
        error: false,
        message: "Image deleted successfully",
        result,
      });
    } else {
      res.status(400).json({
        success: false,
        error: true,
        message: "Failed to delete image",
        result,
      });
    }
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    res.status(500).json({
      success: false,
      error: true,
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
}

//single controller instead of using multiple controllers.
// export const getFilteredProductsController = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ): Promise<void> => {
//   try {
//     const {
//       page = "1",
//       perPage = "10",
//       search,
//       sortBy = "createdAt",
//       sortOrder = "desc",
//       inStock,
//     } = req.query;

//     const catId = req.params.catId;

//     // Validate pagination
//     const currentPage = Number(page);
//     const limit = Number(perPage);

//     if (
//       !Number.isInteger(currentPage) ||
//       !Number.isInteger(limit) ||
//       currentPage <= 0 ||
//       limit <= 0
//     ) {
//       return res.status(400).json({
//         message: "'page' and 'perPage' must be positive integers",
//         success: false,
//         error: true,
//       });
//     }

//     // Build dynamic filter
//     const filter: any = {};

//     if (catId) filter.catId = catId;

//     if (search) {
//       filter.name = { $regex: search.toString(), $options: "i" };
//     }

//     if (inStock === "true") filter.inStock = true;
//     if (inStock === "false") filter.inStock = false;

//     // Get total count
//     const totalProducts = await productModel.countDocuments(filter);
//     const totalPages = Math.ceil(totalProducts / limit);

//     if (currentPage > totalPages && totalPages > 0) {
//       return res.status(404).json({
//         message: "Page not found",
//         success: false,
//         error: true,
//       });
//     }

//     const products = await productModel
//       .find(filter)
//       .populate("category")
//       .sort({ [sortBy as string]: sortOrder === "asc" ? 1 : -1 })
//       .skip((currentPage - 1) * limit)
//       .limit(limit);

//     return res.status(200).json({
//       success: true,
//       error: false,
//       data: products,
//       pagination: {
//         currentPage,
//         perPage: limit,
//         totalProducts,
//         totalPages,
//       },
//     });
//   } catch (error) {
//     console.error("Error fetching filtered products:", error);
//     const message =
//       error instanceof Error ? error.message : "Unknown error occurred";
//     return res.status(500).json({ success: false, error: message });
//   }
// };

export const checkoutController = async (req: Request, res: Response) => {
  try {
    const { productId, quantity = 1, couponCode, userId } = req.body;

    const product = await productModel.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    let discountPercentage = 0;

    if (couponCode) {
      const coupon = await couponModel.findOne({
        code: couponCode.toUpperCase(),
        isActive: true,
      });

      if (
        !coupon ||
        coupon.expiresAt < new Date() ||
        coupon.usedCount >= coupon.usageLimit
      ) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid or expired coupon" });
      }

      if (
        coupon.applicableUsers.length &&
        !coupon.applicableUsers.some((id) => id.toString() === userId)
      ) {
        return res
          .status(403)
          .json({ success: false, message: "Coupon not valid for user" });
      }

      discountPercentage = coupon.discountPercentage;
      coupon.usedCount += 1;
      await coupon.save();
    }

    const totalPrice = product.finalPrice * quantity;
    const finalPrice = Math.round(totalPrice * (1 - discountPercentage / 100));

    res.status(200).json({
      success: true,
      product: {
        name: product.name,
        quantity,
        originalPrice: product.finalPrice,
        discountPercentage,
        finalPrice,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Checkout failed" });
  }
};

/**
 * Recursively fetch all descendant category IDs
 */
const getDescendantCategoryIds = async (
  parentId: mongoose.Types.ObjectId,
): Promise<mongoose.Types.ObjectId[]> => {
  const children = await CategoryModel.find(
    { parentCategoryId: parentId, isActive: true },
    { _id: 1 },
  );

  let ids: mongoose.Types.ObjectId[] = [parentId];

  for (const child of children) {
    const childIds = await getDescendantCategoryIds(child._id);
    ids = ids.concat(childIds);
  }

  return ids;
};

export const getProductsByCategorySlug = async (
  req: Request,
  res: Response,
) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      return res.status(400).json({
        success: false,
        message: "Category slug is required",
      });
    }

    // 1️⃣ Find category by slug
    const category = await CategoryModel.findOne({
      slug,
      isActive: true,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // 2️⃣ Get all category + subcategory IDs
    const categoryIds = await getDescendantCategoryIds(category._id);

    // 3️⃣ Fetch products using $in
    const products = await productModel
      .find({
        category: { $in: categoryIds },
        status: "active",
      })
      .select(
        "name slug finalPrice listedPrice discountPercentage brand images shortDescription rating",
      )
      .lean();

    return res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error("getProductsByCategorySlug error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getProductsByCategoryId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Category ID is required",
      });
    }

    // 1️⃣ Find category by ID
    const category = await CategoryModel.findOne({
      _id: id,
      isActive: true,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // 2️⃣ Get all descendant category IDs (parent + children)
    const categoryIds = await getDescendantCategoryIds(category._id);

    // 3️⃣ Fetch products
    const products = await productModel
      .find({
        category: { $in: categoryIds },
        status: "active",
      })
      .select(
        "name slug finalPrice listedPrice discountPercentage brand images shortDescription rating",
      )
      .lean();

    return res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error("getProductsByCategoryId error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ✅ GET TOP RATED PRODUCTS (rating >= 3)
export const getTopRatedProducts = async (req: Request, res: Response) => {
  try {
    const products = await productModel
      .find({
        rating: { $gte: 3 },
      })
      .sort({ rating: -1 }) // highest rating first
      .limit(20) // optional (you can remove or change)
      .select(
        "name slug finalPrice listedPrice discountPercentage brand images shortDescription rating",
      );

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error: any) {
    console.error("Top rated fetch error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch top rated products",
    });
  }
};

// GET /api/v1/product/products-with-best-discounts
export const getFeaturedProducts = async (req: Request, res: Response) => {
  try {
    // Fetch products with discountPercentage > 30 and select only required fields
    const products = await productModel
      .find({
        status: "active",
        isFeatured: true, // only active products
      })
      .sort({ discountPercentage: -1 }) // highest discount first
      .limit(20) // optional: limit number of products
      .select(
        "name slug finalPrice listedPrice discountPercentage brand images shortDescription rating",
      );

    return res.status(200).json({
      success: true,
      data: products,
    });
  } catch (err) {
    console.error("getFeaturedProducts error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch featured products",
    });
  }
};

// GET /api/v1/product/products-with-best-discounts
export const getBestDiscountProducts = async (req: Request, res: Response) => {
  try {
    const minDiscount = Number(req.query.minDiscount) || 30;

    const products = await productModel
      .find({
        discountPercentage: { $gt: minDiscount },
        status: "active", // ✅ updated field
      })
      .sort({ discountPercentage: -1 })
      .limit(20)
      .select(
        "name slug finalPrice listedPrice discountPercentage brand images shortDescription rating",
      );

    return res.status(200).json({
      success: true,
      data: products,
    });
  } catch (err) {
    console.error("getBestDiscountProducts error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch best discount products",
    });
  }
};

export const getRatingRange = async (req: Request, res: Response) => {
  try {
    const { category } = req.query;

    if (!category) {
      return res.json({
        success: true,
        minRating: 0,
        maxRating: 5,
      });
    }

    const allCategories = await CategoryModel.find()
      .select("_id parentCategoryId")
      .lean();

    const targetId = new mongoose.Types.ObjectId(category as string);

    const categoryIds: mongoose.Types.ObjectId[] = [targetId];

    let added = true;

    // find all child categories
    while (added) {
      added = false;

      for (const cat of allCategories) {
        if (
          cat.parentCategoryId &&
          categoryIds.some(
            (id) => id.toString() === cat.parentCategoryId!.toString(),
          ) &&
          !categoryIds.some((id) => id.toString() === cat._id.toString())
        ) {
          categoryIds.push(cat._id);
          added = true;
        }
      }
    }

    const result = await productModel.aggregate([
      {
        $match: {
          category: { $in: categoryIds }, // make sure this field matches your schema
          status: "active",
          rating: { $exists: true },
        },
      },
      {
        $group: {
          _id: null,
          minRating: { $min: "$rating" },
          maxRating: { $max: "$rating" },
        },
      },
    ]);

    if (!result.length) {
      return res.json({
        success: true,
        minRating: 0,
        maxRating: 0,
      });
    }

    res.json({
      success: true,
      minRating: result[0].minRating,
      maxRating: result[0].maxRating,
    });
  } catch (error) {
    console.error("GET RATING RANGE ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getBrandsByCategory = async (req: Request, res: Response) => {
  try {
    const { category } = req.query;

    if (!category || !mongoose.Types.ObjectId.isValid(category as string)) {
      return res.json({
        success: true,
        brands: [],
      });
    }

    const allCategories = await CategoryModel.find()
      .select("_id parentCategoryId")
      .lean();

    const targetId = new mongoose.Types.ObjectId(category as string);

    const categoryIds: mongoose.Types.ObjectId[] = [targetId];

    let added = true;

    while (added) {
      added = false;

      for (const cat of allCategories) {
        if (
          cat.parentCategoryId &&
          categoryIds.some(
            (id) => id.toString() === cat.parentCategoryId!.toString(),
          ) &&
          !categoryIds.some((id) => id.toString() === cat._id.toString())
        ) {
          categoryIds.push(cat._id);
          added = true;
        }
      }
    }

    const brands = await productModel.distinct("brand", {
      category: { $in: categoryIds },
      status: "active",
    });

    res.json({ success: true, brands });
  } catch (error) {
    console.error("GET BRANDS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    const {
      category,
      page = "1",
      limit = "10",
      minPrice,
      maxPrice,
      rating,
      brands,
      sort,
    } = req.query;

    const pageNumber = Number(page) || 1;
    const pageSize = Number(limit) || 10;

    const filter: any = {
      status: "active",
    };

    /* --------------------------------------------------
       CATEGORY FILTER (parent + nested children)
    -------------------------------------------------- */

    if (category && mongoose.Types.ObjectId.isValid(category as string)) {
      const allCategories = await CategoryModel.find()
        .select("_id parentCategoryId")
        .lean();

      const targetId = new mongoose.Types.ObjectId(category as string);

      const categoryIds: mongoose.Types.ObjectId[] = [targetId];

      let added = true;

      while (added) {
        added = false;

        for (const cat of allCategories) {
          if (
            cat.parentCategoryId &&
            categoryIds.some(
              (id) => id.toString() === cat.parentCategoryId!.toString(),
            ) &&
            !categoryIds.some((id) => id.toString() === cat._id.toString())
          ) {
            categoryIds.push(cat._id);
            added = true;
          }
        }
      }

      filter.category = { $in: categoryIds };
    }

    /* --------------------------------------------------
       BRAND FILTER
    -------------------------------------------------- */

    if (brands) {
      const brandArray = (brands as string).split(",");
      filter.brand = { $in: brandArray };
    }

    /* --------------------------------------------------
       PRICE FILTER
    -------------------------------------------------- */

    if (minPrice || maxPrice) {
      filter.finalPrice = {};

      if (minPrice) filter.finalPrice.$gte = Number(minPrice);
      if (maxPrice) filter.finalPrice.$lte = Number(maxPrice);
    }

    /* --------------------------------------------------
       RATING FILTER
    -------------------------------------------------- */

    if (rating) {
      const ratingArray = (rating as string)
        .split(",")
        .map((r) => Number(r))
        .filter(Boolean);

      if (ratingArray.length > 0) {
        filter.rating = { $gte: Math.max(...ratingArray) };
      }
    }

    /* --------------------------------------------------
       SORTING
    -------------------------------------------------- */

    let sortQuery: any = { createdAt: -1 };

    if (sort === "price:asc") sortQuery = { finalPrice: 1, createdAt: -1 };
    if (sort === "price:desc") sortQuery = { finalPrice: -1, createdAt: -1 };

    if (sort === "name-asc") sortQuery = { name: 1, createdAt: -1 };
    if (sort === "name-desc") sortQuery = { name: -1, createdAt: -1 };

    if (sort === "rating") {
      sortQuery = { rating: -1, createdAt: -1 };
      filter.rating = { $exists: true }; // optional
    }

    /* --------------------------------------------------
       FETCH PRODUCTS
    -------------------------------------------------- */

    const total = await productModel.countDocuments(filter);

    const products = await productModel
      .find(filter)
      .collation({ locale: "en", strength: 2 }) // 🔥 FIX
      .populate("category", "name slug")
      .sort(sortQuery)
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .lean();

    res.json({
      success: true,
      data: products,
      pagination: {
        total,
        page: pageNumber,
        pages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const trackSearch = async (term: string) => {
  await searchAnalytics.findOneAndUpdate(
    { term: term.toLowerCase() },
    { $inc: { count: 1 } },
    { upsert: true, new: true },
  );
};

export const advancedSearch = async (req: Request, res: Response) => {
  const { q, type } = req.query;

  if (!q) {
    return res.json({ success: true, data: [] });
  }

  // 📊 Track search
  await trackSearch(q);

  let products = [];

  // ----------------------------------------
  // 🔹 PRODUCT EXACT MATCH (iPhone 15)
  // ----------------------------------------
  if (type === "product") {
    products = await productModel
      .find({
        name: { $regex: `^${q}$`, $options: "i" },
      })
      .limit(10);
  }

  // ----------------------------------------
  // 🔹 CATEGORY SEARCH (Headphones)
  // ----------------------------------------
  else if (type === "category") {
    const category = await CategoryModel.findOne({
      name: { $regex: q, $options: "i" },
    });

    if (category) {
      products = await productModel
        .find({
          category: category._id,
        })
        .limit(20);
    }
  }

  // ----------------------------------------
  // 🔹 BRAND SEARCH (Nike Shoes)
  // ----------------------------------------
  else if (type === "brand") {
    products = await productModel
      .find({
        brand: { $regex: q, $options: "i" },
      })
      .limit(20);
  }

  // ----------------------------------------
  // 🔹 GENERAL SEARCH
  // ----------------------------------------
  else {
    products = await productModel
      .find({
        $or: [
          { name: { $regex: q, $options: "i" } },
          { brand: { $regex: q, $options: "i" } },
        ],
      })
      .limit(20);
  }

  res.json({
    success: true,
    total: products.length,
    data: products,
  });
};

export const smartSuggest = async (req: Request, res: Response) => {
  const { q } = req.query;

  if (!q) return res.json({ success: true, data: {} });

  const products = await productModel
    .find({
      name: { $regex: q, $options: "i" },
    })
    .limit(5);

  const categories = await CategoryModel.find({
    name: { $regex: q, $options: "i" },
  }).limit(5);

  const brands = await productModel.aggregate([
    {
      $match: {
        brand: { $regex: q, $options: "i" },
      },
    },
    {
      $group: {
        _id: "$brand",
      },
    },
    { $limit: 5 },
  ]);

  res.json({
    success: true,
    data: {
      products,
      categories,
      brands: brands.map((b) => b._id),
    },
  });
};

// POST /api/v1/user/recently-viewed/:productId
export const addRecentlyViewed = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const { productId } = req.params;

    if (!userId) {
      return res.status(200).json({ success: true });
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product id",
      });
    }

    const productObjectId = new mongoose.Types.ObjectId(productId);

    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let list: mongoose.Types.ObjectId[] = user.recentlyViewed || [];

    // remove duplicate
    list = list.filter((id) => id.toString() !== productObjectId.toString());

    // add to top
    list.unshift(productObjectId);

    if (list.length > 10) {
      list = list.slice(0, 10);
    }

    user.recentlyViewed = list;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Product added to recently viewed",
    });
  } catch (error) {
    console.error("addRecentlyViewed error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update recently viewed",
    });
  }
};

// GET /api/v1/user/recently-viewed
// GET /api/v1/product/recently-viewed
export const getRecentlyViewedProducts = async (
  req: Request,
  res: Response,
) => {
  try {
    const userId = req.user?._id;

    // ✅ guest user support (important for your slider)
    if (!userId) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    const user = await UserModel.findById(userId).select("recentlyViewed");

    if (!user || !user.recentlyViewed?.length) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    // ✅ fetch products
    const products = (await productModel
      .find({
        _id: { $in: user.recentlyViewed },
        status: "active",
      })
      .select(
        "name slug finalPrice listedPrice discountPercentage brand images shortDescription rating",
      )) as IProduct[];

    // ✅ maintain order (MOST IMPORTANT)
    const orderedProducts = user.recentlyViewed
      .map((id) =>
        //products.find((p) => p._id.toString() === id.toString())
        // or
        products.find((p) => p._id.equals(id)),
      )
      .filter(Boolean);

    return res.status(200).json({
      success: true,
      data: orderedProducts,
    });
  } catch (error) {
    console.error("getRecentlyViewedProducts error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch recently viewed products",
    });
  }
};

// POST /api/v1/product/get-products-by-ids
export const getProductsByIds = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;

    const products = await productModel.find({
      _id: { $in: ids },
      status: "active",
    });

    res.json({
      success: true,
      data: products,
    });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

export const mergeRecentlyViewed = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const { ids } = req.body;

    if (!userId || !ids?.length) {
      return res.status(200).json({ success: true });
    }

    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false });
    }

    let existing = user.recentlyViewed || [];

    // remove duplicates
    const merged = [
      ...ids,
      ...existing.filter((id: any) => !ids.includes(id.toString())),
    ];

    user.recentlyViewed = merged.slice(0, 10);

    await user.save();

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};
