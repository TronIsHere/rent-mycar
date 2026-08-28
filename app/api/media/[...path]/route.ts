import { readFile } from "fs/promises";
import { NextResponse } from "next/server";
import { getObjectFromS3, isS3Configured } from "@/lib/s3";
import { getLocalUploadPath } from "@/lib/uploads-path";

const ALLOWED_PREFIX = "uploads/";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { path: segments } = await context.params;
  const key = segments.join("/");

  if (!key.startsWith(ALLOWED_PREFIX)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    if (isS3Configured()) {
      const object = await getObjectFromS3(key);
      if (!object) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }

      return new NextResponse(Buffer.from(object.body), {
        headers: {
          "Content-Type": object.contentType,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    const filePath = getLocalUploadPath(key);
    const buffer = await readFile(filePath);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
