import { supabase } from "@/integrations/supabase/client";
import imageCompression from "browser-image-compression";

const BUCKET_NAME = "site-images";

export interface UploadProgress {
  fileName: string;
  progress: number;
  status: "pending" | "compressing" | "uploading" | "complete" | "error";
  error?: string;
  url?: string;
}

export async function compressImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1200,
    useWebWorker: true,
    fileType: "image/jpeg" as const,
    initialQuality: 0.8,
  };

  try {
    return await imageCompression(file, options);
  } catch (error) {
    console.error("Compression failed, using original:", error);
    return file;
  }
}

export function getImagePath(userId: string, siteId: string, imageType: string, fileName: string): string {
  const timestamp = Date.now();
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
  return `${userId}/${siteId}/${imageType}/${timestamp}-${sanitizedName}`;
}

export function getPublicUrl(path: string): string {
  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadImage(
  file: File,
  userId: string,
  siteId: string,
  imageType: "gallery" | "logo" | "before" | "after",
  onProgress?: (progress: number) => void
): Promise<{ url: string; path: string }> {
  // Compress the image first
  onProgress?.(10);
  const compressedFile = await compressImage(file);
  
  onProgress?.(30);
  
  const path = getImagePath(userId, siteId, imageType, file.name);
  
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(path, compressedFile, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  onProgress?.(100);
  
  return {
    url: getPublicUrl(path),
    path,
  };
}

export async function deleteImage(path: string): Promise<void> {
  const { error } = await supabase.storage.from(BUCKET_NAME).remove([path]);
  
  if (error) {
    throw new Error(error.message);
  }
}

export async function listUserImages(userId: string, siteId: string): Promise<string[]> {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .list(`${userId}/${siteId}`, {
      limit: 100,
      sortBy: { column: "created_at", order: "desc" },
    });

  if (error) {
    throw new Error(error.message);
  }

  return data?.map((file) => `${userId}/${siteId}/${file.name}`) || [];
}

// Extract path from full URL
export function extractPathFromUrl(url: string): string | null {
  const match = url.match(/\/site-images\/(.+)$/);
  return match ? match[1] : null;
}
