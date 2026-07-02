import { Request, Response } from "express";
import UserModel from "../models/userModel.js";
import WishlistModel from "../models/wishlistModel.js";

// export const addToWishlistController = async (req: Request, res: Response) => {
//   try {
//     const userId = req.user?._id;

//     if (!userId) {
//       return res.status(401).json({ message: "User not authenticated" });
//     }

//     const { productId, quantity, size, color } = req.body;

//     if (!productId || !quantity) {
//       return res.status(400).json({
//         message: "Product ID and quantity are required",
//         error: true,
//         success: false,
//       });
//     }

//     const existingWishlistItem = await WishlistModel.findOne({
//       productId,
//       userId,
//     });

//     if (existingWishlistItem) {
//       existingWishlistItem.quantity += quantity;
//       existingWishlistItem.size = size;
//       existingWishlistItem.color = color;
//       await existingWishlistItem.save();
//     } else {
//       await WishlistModel.create({
//         productId,
//         quantity,
//         userId,
//         size,
//         color,
//       });
//     }

//     await UserModel.updateOne(
//       { _id: userId },
//       { $push: { shopping_cart: productId } }
//     );

//     return res.status(200).json({
//       message: "Item added to wishlist successfully",
//       error: false,
//       success: true,
//     });
//   } catch (error: any) {
//     res.status(500).json({
//       message: error.message,
//       error: true,
//       success: false,
//     });
//   }
// };

// export const getWishlistItemsController = async (req: Request, res: Response) => {
//   try {
//     const userId = req.user?._id;

//     if (!userId) {
//       return res.status(401).json({
//         message: "User not authenticated",
//         error: true,
//         success: false,
//       });
//     }

//     const cartItems = await WishlistModel.find({ userId })
//       .populate("productId", "name price images")
//       .lean();

//     return res.status(200).json({
//       message: "Wishlist items fetched successfully",
//       error: false,
//       success: true,
//       data: cartItems,
//     });
//   } catch (error: any) {
//     return res.status(500).json({
//       message: error.message,
//       error: true,
//       success: false,
//     });
//   }
// };

// export const updateWishlistItemController = async (req: Request, res: Response) => {
//   try {
//     const userId = req.user?._id;

//     if (!userId) {
//       return res.status(401).json({ message: "User not authenticated" });
//     }

//     const { cartItemId, quantity, size, color } = req.body;

//     if (!cartItemId || !quantity) {
//       return res.status(400).json({
//         message: "Wishlist item ID and quantity are required",
//         error: true,
//         success: false,
//       });
//     }

//     const cartItem = await WishlistModel.findOne({
//       _id: cartItemId,
//       userId,
//     });

//     if (!cartItem) {
//       return res.status(404).json({
//         message: "Wishlist item not found",
//         error: true,
//         success: false,
//       });
//     }

//     cartItem.quantity = quantity;
//     cartItem.size = size;
//     cartItem.color = color;
//     await cartItem.save();

//     return res.status(200).json({
//       message: "Wishlist item updated successfully",
//       error: false,
//       success: true,
//       data: cartItem,
//     });
//   } catch (error: any) {
//     res.status(500).json({
//       message: error.message,
//       error: true,
//       success: false,
//     });
//   }
// };

// export const deleteWishlistItemController = async (req: Request, res: Response) => {
//   try {
//     const userId = req.user?._id;

//     if (!userId) {
//       return res.status(401).json({ message: "User not authenticated" });
//     }

//     const { cartItemId } = req.body;

//     if (!cartItemId) {
//       return res.status(400).json({
//         message: "Wishlist item ID is required",
//         error: true,
//         success: false,
//       });
//     }

//     const cartItem = await WishlistModel.findOne({
//       _id: cartItemId,
//       userId,
//     });

//     if (!cartItem) {
//       return res.status(404).json({
//         message: "Wishlist item not found",
//         error: true,
//         success: false,
//       });
//     }

//     await WishlistModel.deleteOne({ _id: cartItemId, userId });

//     return res.status(200).json({
//       message: "Wishlist item deleted successfully",
//       error: false,
//       success: true,
//     });
//   } catch (error: any) {
//     res.status(500).json({
//       message: error.message,
//       error: true,
//       success: false,
//     });
//   }
// };

export const toggleWishlistController = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    const { productId, size, color } = req.body;

    const existing = await WishlistModel.findOne({
      userId,
      productId,
    });

    if (existing) {
      await WishlistModel.deleteOne({ _id: existing._id });

      return res.json({
        success: true,
        message: "Removed from wishlist",
      });
    }

    await WishlistModel.create({
      userId,
      productId,
      size,
      color,
    });

    res.json({
      success: true,
      message: "Added to wishlist",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong";

    res.status(500).json({
      success: false,
      message,
    });
  }
};

export const getWishlistController = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;

    const items = await WishlistModel.find({ userId })
      .populate("productId") // 🔥 FULL PRODUCT
      .lean();

    res.json({
      success: true,
      data: items,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong";

    res.status(500).json({
      success: false,
      message,
    });
  }
};
