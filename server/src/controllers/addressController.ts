import addressModel from "../models/addressModal.js";
import { Request, Response } from "express";

/* =============================
   GET USER ADDRESSES
============================= */
export const getUserAddresses = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;

    const addresses = await addressModel.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: addresses,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch addresses" });
  }
};


/* =============================
   ADD ADDRESS (MAX 5 LIMIT)
============================= */
export const addAddress = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;

    const count = await addressModel.countDocuments({ userId });

    if (count >= 5) {
      return res.status(400).json({
        success: false,
        message: "You can only save up to 5 addresses",
      });
    }

    const address = await addressModel.create({
      ...req.body,
      userId,
    });

    res.status(201).json({
      success: true,
      data: address,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to add address" });
  }
};


/* =============================
   DELETE ADDRESS (SECURE)
============================= */
export const deleteAddress = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;

    const deleted = await addressModel.findOneAndDelete({
      _id: req.params.id,
      userId,
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to delete address" });
  }
};


/* =============================
   EDIT ADDRESS (SECURE FIX)
============================= */
export const editAddress = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;

    const updated = await addressModel.findOneAndUpdate(
      { _id: req.params.id, userId },
      { ...req.body },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update address" });
  }
};