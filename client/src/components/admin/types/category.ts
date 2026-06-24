// src/types/category.ts

export interface ImageMetadata {
  url: string;
  public_id: string;
  format?: string;
  width?: number;
  height?: number;
  size?: number;
  alt?: string;
  uploadedAt?: string;
}

export interface Category {
  _id?: string; // MongoDB id
  id?: string;  // Normalized id for frontend
  name: string;
  slug?: string;
  description?: string;
  image?: ImageMetadata; // ✅ Use the new type here
  parentCategoryId?: string | null;
  subcategories: Category[];
  createdAt: Date;
  createdBy?: string;
  updatedAt: Date;
  updatedBy?: string;
}

export interface CategoryFormData {
  name: string;
  description?: string;
  parentCategoryId?: string | null;
  imageFile?: File;
}
