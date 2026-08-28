const UPLOADS_PREFIX = "uploads/";

export function extractObjectKey(url: string): string | null {
  if (url.startsWith("/api/media/")) {
    return url.slice("/api/media/".length);
  }

  if (url.startsWith("/uploads/")) {
    return url.slice(1);
  }

  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname.replace(/^\//, "");
    const bucket = process.env.S3_BUCKET?.trim();

    if (pathname.startsWith(UPLOADS_PREFIX)) {
      return pathname;
    }

    if (bucket && pathname.startsWith(`${bucket}/`)) {
      const key = pathname.slice(bucket.length + 1);
      if (key.startsWith(UPLOADS_PREFIX)) {
        return key;
      }
    }

    // Legacy virtual-host URLs: https://bananaai.nbg1.your-objectstorage.com/uploads/...
    if (
      bucket &&
      parsed.hostname.startsWith(`${bucket}.`) &&
      pathname.startsWith(UPLOADS_PREFIX)
    ) {
      return pathname;
    }
  } catch {
    return null;
  }

  return null;
}

export function getMediaProxyUrl(key: string): string {
  return `/api/media/${key}`;
}

/** Same-origin URL for browser use (Three.js textures, img tags). */
export function resolveMediaUrl(url: string): string {
  const key = extractObjectKey(url);
  if (key) {
    return getMediaProxyUrl(key);
  }

  return url;
}
