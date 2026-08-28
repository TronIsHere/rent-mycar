import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getMediaProxyUrl } from "@/lib/media-url";

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function isS3Configured(): boolean {
  return Boolean(
    process.env.S3_ENDPOINT?.trim() &&
      process.env.S3_BUCKET?.trim() &&
      process.env.S3_ACCESS_KEY_ID?.trim() &&
      process.env.S3_SECRET_ACCESS_KEY?.trim(),
  );
}

let client: S3Client | null = null;

function shouldForcePathStyle(): boolean {
  const explicit = process.env.S3_FORCE_PATH_STYLE?.trim();
  if (explicit === "true") return true;
  if (explicit === "false") return false;

  const endpoint = process.env.S3_ENDPOINT?.trim() ?? "";
  return endpoint.includes("your-objectstorage.com");
}

function getS3Client(): S3Client {
  if (client) return client;

  client = new S3Client({
    endpoint: requireEnv("S3_ENDPOINT"),
    region: process.env.S3_REGION?.trim() || "auto",
    credentials: {
      accessKeyId: requireEnv("S3_ACCESS_KEY_ID"),
      secretAccessKey: requireEnv("S3_SECRET_ACCESS_KEY"),
    },
    forcePathStyle: shouldForcePathStyle(),
  });

  return client;
}

/** Path-style direct URL, e.g. https://nbg1.your-objectstorage.com/bananaai/uploads/... */
export function getDirectObjectUrl(key: string): string {
  const publicBase = process.env.S3_PUBLIC_URL?.trim();
  if (publicBase) {
    return `${publicBase.replace(/\/$/, "")}/${key}`;
  }

  const bucket = requireEnv("S3_BUCKET");
  const endpoint = requireEnv("S3_ENDPOINT").replace(/\/$/, "");

  if (shouldForcePathStyle()) {
    return `${endpoint}/${bucket}/${key}`;
  }

  const endpointUrl = new URL(endpoint);
  return `${endpointUrl.protocol}//${bucket}.${endpointUrl.host}/${key}`;
}

export function getPublicObjectUrl(key: string): string {
  return getMediaProxyUrl(key);
}

export async function uploadToS3(
  key: string,
  body: Buffer,
  contentType: string,
): Promise<string> {
  const bucket = requireEnv("S3_BUCKET");

  await getS3Client().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );

  return getPublicObjectUrl(key);
}

export async function deleteFromS3(key: string): Promise<void> {
  const bucket = requireEnv("S3_BUCKET");

  await getS3Client().send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  );
}

export async function getObjectFromS3(
  key: string,
): Promise<{ body: Uint8Array; contentType: string } | null> {
  const bucket = requireEnv("S3_BUCKET");

  const response = await getS3Client().send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  );

  if (!response.Body) {
    return null;
  }

  return {
    body: await response.Body.transformToByteArray(),
    contentType: response.ContentType ?? "application/octet-stream",
  };
}
