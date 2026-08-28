import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import sharp from "sharp";
import { isS3Configured, uploadToS3 } from "@/lib/s3";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

async function validateImage(file: File): Promise<Buffer> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("فرمت تصویر مجاز نیست. JPEG، PNG یا WebP انتخاب کنید.");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("حجم تصویر نباید بیشتر از ۵ مگابایت باشد.");
  }

  return Buffer.from(await file.arrayBuffer());
}

async function saveProcessedImage(
  folder: "ads" | "payments",
  processed: Buffer,
): Promise<string> {
  const filename = `${randomUUID()}.webp`;
  const objectKey = `uploads/${folder}/${filename}`;

  if (isS3Configured()) {
    return uploadToS3(objectKey, processed, "image/webp");
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(uploadsDir, { recursive: true });
  await writeFile(path.join(uploadsDir, filename), processed);

  return `/uploads/${folder}/${filename}`;
}

export async function saveAdImage(file: File): Promise<string> {
  const buffer = await validateImage(file);
  const processed = await sharp(buffer)
    .rotate()
    .resize({ width: 800, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();

  return saveProcessedImage("ads", processed);
}

export async function savePaymentScreenshot(file: File): Promise<string> {
  const buffer = await validateImage(file);
  const processed = await sharp(buffer)
    .rotate()
    .resize({ width: 1200, withoutEnlargement: true })
    .webp({ quality: 85 })
    .toBuffer();

  return saveProcessedImage("payments", processed);
}
