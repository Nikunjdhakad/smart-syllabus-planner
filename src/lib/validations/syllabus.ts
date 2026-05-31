import { z } from "zod";

export const manualSyllabusSchema = z.object({
  title: z.string().min(1, "Title is required").max(200).trim(),
  rawContent: z.string().min(10, "Content must be at least 10 characters").max(50000).trim(),
});

// File validation constants
export const ALLOWED_PDF_TYPES = ["application/pdf"] as const;
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
] as const;

export const MAX_FILE_SIZE_MB = 10;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
