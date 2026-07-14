import cloudinary from "../config/cloudinary.js";
import fs from "fs";

// ===== Cloudinary Upload Helper =====
export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  created_at: string;
  resource_type: string;
}

export async function uploadToCloudinary(
  localPath: string,
  folder = "uploads",
): Promise<CloudinaryUploadResult> {
  try {
    const result = await cloudinary.uploader.upload(localPath, {
      folder,
      use_filename: true,
      unique_filename: false,
      overwrite: false,
    });

    // ✅ delete local file after upload
    fs.unlinkSync(localPath);

    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
      created_at: result.created_at,
      resource_type: result.resource_type,
    };
  } catch (error) {
    // cleanup even if failed
    if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
    throw error;
  }
}

// ===== Upload Multiple Files =====
export const uploadMultipleToCloudinary = async (files: any[]) => {
  const results = await Promise.all(
    files.map((file) => uploadToCloudinary(file.path)),
  );
  return results;
};

export const destroyCloudinaryById = async (publicId: string) => {
  try {
    await cloudinary.uploader.destroy(publicId, { invalidate: true });
  } catch (err) {
    console.warn("Cloudinary destroy error:", err);
  }
};

// ===== Delete Multiple Files =====
export const deleteFilesFromCloudinary = async (publicIds: string[]) => {
  if (!publicIds.length) return;

  try {
    await Promise.all(
      publicIds.map((id) =>
        cloudinary.uploader.destroy(id, { invalidate: true }),
      ),
    );
  } catch (err) {
    console.warn("Cloudinary destroy error:", err);
  }
};


export async function uploadChatMedia(
  file: Express.Multer.File,
  folder = "chat"
) {
  try {
    const mimeType = file.mimetype;

    const getType = (mime: string) => {
      if (mime.startsWith("image")) return "image";
      if (mime.startsWith("video")) return "video";
      if (mime.startsWith("audio")) return "audio";
      return "document";
    };

    const resourceType = mimeType.startsWith("video")
      ? "video"
      : mimeType.startsWith("audio")
      ? "video"
      : "image";

    const result = await cloudinary.uploader.upload(file.path, {
      folder,
      resource_type: resourceType,
    });

    fs.unlinkSync(file.path);

    return {
      url: result.secure_url,
      public_id: result.public_id,
      mimeType,
      type: getType(mimeType), // ✅ IMPORTANT
      size: result.bytes,
      duration: result.duration || null,
      thumbnail: result.secure_url,
    };
  } catch (error) {
    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    throw error;
  }
}


export const uploadMultipleChatMedia = async (
  files: Express.Multer.File[]
) => {
  return Promise.all(files.map((file) => uploadChatMedia(file)));
};