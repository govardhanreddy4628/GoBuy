// middleware/multer.ts
import multer, { StorageEngine } from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import {
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_MB,
  MAX_FILES,
} from "../config/uploadConfig.js";

// ===== Fix for __dirname in ESM =====
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Make sure destination uses req.folder if set, otherwise fallback
const storage: StorageEngine = multer.diskStorage({
  destination: function (req: any, file, cb) {
    const folder = req?.folder || "uploads";
    const destPath = path.resolve(process.cwd(), "public", folder);

    try {
      // ✅ Make directory synchronously to ensure multer waits
      fs.mkdirSync(destPath, { recursive: true });
      cb(null, destPath);
    } catch (err) {
      cb(err as Error, destPath);
    }
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

// File filter validates mime types
const fileFilter = (req: any, file: any, cb: any) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only images are allowed."), false);
  }
};

const multerUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE_MB * 1024 * 1024,
  },
});


export const handleMulterError = (uploadMiddleware: any) => {
  return (req: any, res: any, next: any) => {
    uploadMiddleware(req, res, (err: any) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: err.message });
      }
      if (err) {
        return res.status(400).json({ message: err.message || "Upload error" });
      }
      next();
    });
  };
};

const uploadSingle = multerUpload.single("image");
const uploadMultiple = multerUpload.array("images", MAX_FILES);
const uploadMultipleMedia = multerUpload.array("media", MAX_FILES);
const uploadSingleMedia = multerUpload.single("media"); // ✅ new — for one-file-per-message chat uploads

export { uploadSingle, uploadMultiple, uploadMultipleMedia, uploadSingleMedia };
