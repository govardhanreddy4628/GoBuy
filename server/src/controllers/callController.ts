import { Request, Response } from "express";
import callModel from "../models/callModel.js";


export const getCallHistory = async (req: Request, res: Response) => {
  const userId = req.user._id;

  const calls = await callModel.find({
    $or: [{ caller: userId }, { receiver: userId }],
  }).sort({ createdAt: -1 });

  res.json(calls);
};