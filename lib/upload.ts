import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import sharp from "sharp";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export async function saveAdImage(file: File): Promise<string> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("فرمت تصویر مجاز نیست. JPEG، PNG یا WebP انتخاب کنید.");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("حجم تصویر نباید بیشتر از ۵ مگابایت باشد.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const processed = await sharp(buffer)
    .rotate()
    .resize({ width: 800, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();

  const uploadsDir = path.join(process.cwd(), "public", "uploads", "ads");
  await mkdir(uploadsDir, { recursive: true });

  const filename = `${randomUUID()}.webp`;
  await writeFile(path.join(uploadsDir, filename), processed);

  return `/uploads/ads/${filename}`;
}
