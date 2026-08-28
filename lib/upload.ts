import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import sharp from "sharp";
import { extractObjectKey, getMediaProxyUrl } from "@/lib/media-url";
import { deleteFromS3, isS3Configured, uploadToS3 } from "@/lib/s3";
import {
  getLocalUploadPath,
  getUploadObjectKey,
} from "@/lib/uploads-path";

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
  const objectKey = getUploadObjectKey(folder, filename);

  if (isS3Configured()) {
    return uploadToS3(objectKey, processed, "image/webp");
  }

  const filePath = getLocalUploadPath(objectKey);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, processed);

  return getMediaProxyUrl(objectKey);
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

export async function deleteMediaByUrl(url: string): Promise<void> {
  const key = extractObjectKey(url);
  if (!key) return;

  if (isS3Configured()) {
    await deleteFromS3(key);
    return;
  }

  const filePath = getLocalUploadPath(key);
  try {
    await unlink(filePath);
  } catch {
    // File may already be missing; ignore.
  }
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
