import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";
// Allow overriding basePath/assetPrefix for GitHub Pages via env
const basePath = process.env.BASE_PATH || ""; // e.g. "/repo-name" or ""

const nextConfig: NextConfig = {
  output: "export",
  // If hosting under subpath (GitHub Pages project site), set basePath.
  // BASE_PATH should include leading slash, e.g. "/my-repo".
  ...(basePath
    ? {
        basePath,
        assetPrefix: basePath + "/",
      }
    : {}),
  // You can enable trailingSlash to ensure directory-style URLs.
  trailingSlash: true,
};

export default nextConfig;
