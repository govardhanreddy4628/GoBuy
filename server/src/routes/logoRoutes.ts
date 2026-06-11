// routes/logoRoutes.ts
import express from "express";
import {
  createLogo,
  getLogos,
  getActiveLogo,
  setActiveLogo,
  updateLogo,
  deleteLogo,
} from "../controllers/logoController.js";
import { uploadSingle } from "../middleware/multer.js";
import logoModel from "../models/logoModel.js";


const logoRouter = express.Router();

logoRouter.post("/", uploadSingle, createLogo);
logoRouter.get("/", getLogos);
logoRouter.get("/active", getActiveLogo);
//logoRouter.put("/active/:id", setActiveLogo);
// Activate logo (and deactivate others)
logoRouter.put("/active/:id", async (req, res) => {
  await logoModel.updateMany({}, { isActive: false }); // 🔥 important
  await logoModel.findByIdAndUpdate(req.params.id, { isActive: true });
  res.json({ success: true });
});

// Deactivate single logo
logoRouter.put("/inactive/:id", async (req, res) => {
  await logoModel.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ success: true });
});
logoRouter.put("/:id", uploadSingle, updateLogo);
logoRouter.delete("/:id", deleteLogo);

export default logoRouter;