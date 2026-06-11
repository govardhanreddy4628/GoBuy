// controllers/logoController.ts
import Logo from "../models/logoModel.js";
import cloudinary from "../config/cloudinary.js";

// ✅ CREATE LOGO
export const createLogo = async (req: any, res: any) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "logos",
    });

    const logo = await Logo.create({
      image: result.secure_url,
      public_id: result.public_id,
    });

    res.json({ success: true, logo });
  } catch (err) {
    res.status(500).json({ message: "Error uploading logo" });
  }
};

// ✅ GET ALL LOGOS
export const getLogos = async (_req: any, res: any) => {
  const logos = await Logo.find().sort({ createdAt: -1 });
  res.json({ success: true, logos });
};

// ✅ GET ACTIVE LOGO (FOR USER APP)
export const getActiveLogo = async (_req: any, res: any) => {
  const logo = await Logo.findOne({ isActive: true });

  res.json({ success: true, logo });
};

// ✅ SET ACTIVE LOGO
export const setActiveLogo = async (req: any, res: any) => {
  try {
    const { id } = req.params;

    // deactivate all
    await Logo.updateMany({}, { isActive: false });

    // activate selected
    const logo = await Logo.findByIdAndUpdate(
      id,
      { isActive: true },
      { new: true }
    );

    res.json({ success: true, logo });
  } catch {
    res.status(500).json({ message: "Error setting active logo" });
  }
};

// ✅ UPDATE LOGO (replace image)
export const updateLogo = async (req: any, res: any) => {
  try {
    const logo = await Logo.findById(req.params.id);

    if (!logo) return res.status(404).json({ message: "Not found" });

    // delete old image
    await cloudinary.uploader.destroy(logo.public_id);

    // upload new
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "logos",
    });

    logo.image = result.secure_url;
    logo.public_id = result.public_id;

    await logo.save();

    res.json({ success: true, logo });
  } catch {
    res.status(500).json({ message: "Error updating logo" });
  }
};

// ✅ DELETE LOGO
export const deleteLogo = async (req: any, res: any) => {
  try {
    const logo = await Logo.findById(req.params.id);

    if (!logo) return res.status(404).json({ message: "Not found" });

    await cloudinary.uploader.destroy(logo.public_id);
    await logo.deleteOne();

    res.json({ success: true, message: "Deleted" });
  } catch {
    res.status(500).json({ message: "Error deleting logo" });
  }
};