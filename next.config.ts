import type { NextConfig } from "next";

function getS3ImagePatterns() {
  const patterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [];

  const publicUrl = process.env.S3_PUBLIC_URL?.trim();
  if (publicUrl) {
    try {
      const url = new URL(publicUrl);
      patterns.push({
        protocol: url.protocol.replace(":", "") as "http" | "https",
        hostname: url.hostname,
        pathname: "/**",
      });
    } catch {
      // ignore invalid S3_PUBLIC_URL at build time
    }
  }

  const endpoint = process.env.S3_ENDPOINT?.trim();
  const bucket = process.env.S3_BUCKET?.trim();
  if (endpoint && bucket) {
    try {
      const endpointUrl = new URL(endpoint);
      const forcePathStyle = process.env.S3_FORCE_PATH_STYLE === "true";

      if (forcePathStyle) {
        patterns.push({
          protocol: endpointUrl.protocol.replace(":", "") as "http" | "https",
          hostname: endpointUrl.hostname,
          pathname: `/${bucket}/**`,
        });
      } else {
        patterns.push({
          protocol: endpointUrl.protocol.replace(":", "") as "http" | "https",
          hostname: `${bucket}.${endpointUrl.hostname}`,
          pathname: "/**",
        });
      }
    } catch {
      // ignore invalid S3_ENDPOINT at build time
    }
  }

  return patterns;
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: getS3ImagePatterns(),
  },
};

export default nextConfig;
