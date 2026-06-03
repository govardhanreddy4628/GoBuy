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
