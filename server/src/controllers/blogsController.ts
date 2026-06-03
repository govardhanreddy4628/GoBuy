import { Request, Response } from "express";
import blogsModel from "../models/blogsModel.js";


// CREATE
export const createBlog = async (req: any, res: any) => {
  try {
    const image = req.file
      ? `/public/${req.folder || "uploads"}/${req.file.filename}`
      : "";

    const blog = await Blog.create({
      ...req.body,
      image,
    });

    res.status(201).json(blog);
  } catch (err) {
    res.status(500).json({ message: "Error creating blog", err });
  }
};


// GET ALL (pagination + search + filter)
export const getBlogs = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 6, search = "", category } = req.query;

    const query: any = {
      title: { $regex: search, $options: "i" },
    };

    if (category) query.category = category;

    const blogs = await blogsModel.find(query)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await blogsModel.countDocuments(query);

    res.json({
      blogs,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
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
export const updateBlog = async (req: Request, res: Response) => {
  try {
    const blog = await blogsModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
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