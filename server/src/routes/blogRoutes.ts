import express from "express";
import {createBlog, getBlogs, getBlogById, updateBlog, deleteBlog} from "../controllers/blogsController.js";
import { Request, Response, NextFunction } from "express";
import { uploadSingle } from "../middleware/multer.js";


const blogRouter = express.Router();

const asyncHandler = (fn: any) => (req: any, res: any, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

blogRouter.post("/", (req:Request, _res, next) => {
  req.folder = "blogs"; // 👈 dynamic folder
  next();
}, uploadSingle, createBlog);
blogRouter.get("/", getBlogs);
blogRouter.get("/:id", asyncHandler(getBlogById));
blogRouter.put("/:id", uploadSingle, asyncHandler(updateBlog));
blogRouter.delete("/:id", asyncHandler(deleteBlog));

export default blogRouter;