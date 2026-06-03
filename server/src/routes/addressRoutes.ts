import express from "express";
import { authenticate } from "../middleware/authenticate.js";
import { addAddress, deleteAddress, editAddress, getUserAddresses } from "../controllers/addressController.js";

const addressRouter = express.Router();

const asyncHandler = (fn: any) => (req: any, res: any, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

addressRouter.get("/get", authenticate(), asyncHandler(getUserAddresses));
addressRouter.post("/add", authenticate(), asyncHandler(addAddress));
addressRouter.put("/edit/:id", authenticate(), asyncHandler(editAddress));
addressRouter.delete("/delete/:id", authenticate(), asyncHandler(deleteAddress));


export default addressRouter;
