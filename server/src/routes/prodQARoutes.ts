import express from "express";
import {
  getProductQAs,
  addQuestion,
  addAnswer,
  markHelpful,
} from "../controllers/prodQAController.js";
import { authenticate } from "../middleware/authenticate.js";

const questionsRouter = express.Router();

const asyncHandler = (fn: any) => (req: any, res: any, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

questionsRouter.get("/", getProductQAs);
questionsRouter.post("/ask", authenticate(), asyncHandler(addQuestion));
questionsRouter.post("/answer", asyncHandler(addAnswer));
questionsRouter.post("/helpful", authenticate(), asyncHandler(markHelpful));

export default questionsRouter;