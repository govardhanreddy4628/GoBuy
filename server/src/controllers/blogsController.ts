import { Request, Response } from "express";
import blogsModel from "../models/blogsModel.js";
import cloudinary from "../config/cloudinary.js";

// CREATE
export const createBlog = async (req: any, res: any) => {
  try {
    let imageUrl = "";

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "blogs",
      });
      imageUrl = result.secure_url;
    }

    const blog = await blogsModel.create({
      ...req.body,
      image: imageUrl,
    });

    res.status(201).json(blog);
  } catch (err) {
    res.status(500).json({ message: "Error creating blog" });
  }
};

// ✅ GET ALL (NO FILTER, NO PAGINATION)
export const getBlogs = async (req: Request, res: Response) => {
  try {
    const blogs = await blogsModel.find().sort({ createdAt: -1 });

    res.json({
      blogs,
    });
  } catch {
    res.status(500).json({ message: "Error fetching blogs" });
  }
};

// GET ONE
export const getBlogById = async (req: Request, res: Response) => {
  try {
    const blog = await blogsModel.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Not found" });
    res.json(blog);
  } catch {
    res.status(500).json({ message: "Error fetching blog" });
  }
};

// UPDATE
export const updateBlog = async (req: any, res: any) => {
  try {
    let updateData = { ...req.body };

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "blogs",
      });
      updateData.image = result.secure_url;
    }

    const blog = await blogsModel.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json(blog);
  } catch {
    res.status(500).json({ message: "Error updating blog" });
  }
};

// DELETE
export const deleteBlog = async (req: Request, res: Response) => {
  try {
    await blogsModel.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch {
    res.status(500).json({ message: "Error deleting blog" });
  }
};