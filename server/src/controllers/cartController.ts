import { Request, Response } from "express";
import CartModel from "../models/cartModel.js";
import productModel, { IProduct } from "../models/productModel.js";

// ✅ GET USER CART
export const getCartItemsController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const cartItems = await CartModel.find({ userId })
      .populate("productId", "name listedPrice finalPrice discountPercentage images quantityInStock brand")
      .lean();

    return res.status(200).json({
      success: true,
      data: cartItems,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ ADD TO CART
export const addToCartController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const { productId, quantity = 1, size = null, color = null } = req.body;

    console.log("BODY:", req.body);
    console.log("USER:", req.user);

    if (!productId || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid product or quantity",
      });
    }

    
    const product = await productModel.findById(productId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    
    if (
      product.quantityInStock !== undefined &&
      quantity > product.quantityInStock
    ) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.quantityInStock} items available`,
      });
    }

    // 🔥 IMPORTANT: include size + color
    const existingItem = await CartModel.findOne({
      userId,
      productId,
      size,
      color,
    });

    const expiry = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);

    // ITEM ALREADY IN CART
    if (existingItem) {
      const newQty = existingItem.quantity + quantity;

      existingItem.quantity = Math.min(newQty, product.quantityInStock);
      existingItem.expiresAt = expiry;

      await existingItem.save();
      await productModel.findByIdAndUpdate(productId, { $inc: { cartAdds: 1 } });

      return res.json({
        success: true,
        message: "Cart updated",
        data: existingItem,
      });
    }

    // NEW ITEM
    const newItem = await CartModel.create({
      userId,
      productId,
      quantity,
      size,
      color,
      expiresAt: expiry,
    });

    // 🔥 analytics
    await productModel.findByIdAndUpdate(productId, {
      $inc: { cartAdds: 1 },
    });
    
    return res.status(201).json({
      success: true,
      message: "Item added",
      data: newItem,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ DELETE ITEM
export const deleteCartItemController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const { cartItemId } = req.params;

    if (!userId || !cartItemId) {
      return res.status(400).json({
        success: false,
        message: "Invalid request",
      });
    }

    await CartModel.deleteOne({ _id: cartItemId, userId });

    return res.json({
      success: true,
      message: "Item removed",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ UPDATE ITEM
export const updateCartItemController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const { cartItemId } = req.params;
    const { quantity, size, color } = req.body;

    if (!userId || !cartItemId) {
      return res.status(400).json({
        success: false,
        message: "Invalid request",
      });
    }

    if (quantity <= 0) {
      await CartModel.deleteOne({ _id: cartItemId, userId });
      return res.json({ success: true, message: "Item removed" });
    }

    const item = await CartModel.findOne({ _id: cartItemId, userId });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    const product = await productModel.findById(item.productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (quantity > product.quantityInStock) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.quantityInStock} available`,
      });
    }

    item.quantity = quantity;
    item.size = size ?? item.size;
    item.color = color ?? item.color;
    item.expiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);

    await item.save();

    return res.json({
      success: true,
      data: item,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 🔥 MERGE CART (IMPORTANT)
export const mergeCart = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const { items } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.json({ success: true, data: [] });
    }

    // ✅ Normalize items (include variants)
    const normalizedItems = items.map((i) => ({
      productId: i.productId,
      quantity: i.quantity,
      size: i.size || null,
      color: i.color || null,
    }));

    const productIds = normalizedItems.map((i) => i.productId);

    // 🔥 Fetch all products
    const products = await productModel
      .find({ _id: { $in: productIds } })
      .lean<IProduct[]>();

    const productMap = new Map<string, IProduct>();

    products.forEach((p) => {
      productMap.set(String(p._id), p);
    });

    // 🔥 Fetch existing cart items
    const existingItems = await CartModel.find({
      userId,
      productId: { $in: productIds },
    });

    // 🔥 Key = productId + size + color
    const existingMap = new Map();
    existingItems.forEach((item) => {
      const key = `${item.productId}_${item.size}_${item.color}`;
      existingMap.set(key, item);
    });

    const bulkOps: any[] = [];

    for (const item of normalizedItems) {
      const { productId, quantity, size, color } = item;

      const product = productMap.get(productId);
      if (!product) continue;

      const key = `${productId}_${size}_${color}`;
      const existing = existingMap.get(key);

      if (existing) {
        const newQty = Math.min(
          existing.quantity + quantity,
          product.quantityInStock,
        );

        bulkOps.push({
          updateOne: {
            filter: { _id: existing._id },
            update: {
              quantity: newQty,
              expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
            },
          },
        });
      } else {
        bulkOps.push({
          insertOne: {
            document: {
              userId,
              productId,
              quantity: Math.min(quantity, product.quantityInStock),
              size,
              color,
              expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
            },
          },
        });
      }
    }

    if (bulkOps.length > 0) {
      await CartModel.bulkWrite(bulkOps);
    }

    // ✅ Return final cart
    const finalCart = await CartModel.find({ userId })
      .populate("productId")
      .lean();

    return res.json({
      success: true,
      data: finalCart,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
