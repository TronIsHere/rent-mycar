import path from "path";

export function getUploadsRoot(): string {
  const configured = process.env.UPLOADS_DIR?.trim();
  if (configured) {
    return path.isAbsolute(configured)
      ? configured
      : path.join(process.cwd(), configured);
  }

  return path.join(process.cwd(), "..", "uploads");
}

export function getUploadObjectKey(
  folder: "ads" | "payments",
  filename: string,
): string {
  return `uploads/${folder}/${filename}`;
}

export function getLocalUploadPath(key: string): string {
  return path.join(getUploadsRoot(), key.replace(/^uploads\//, ""));
}
