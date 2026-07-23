import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Bundle the knowledge base .txt files with the serverless functions
  // so /api/reingest can read them at runtime
  outputFileTracingIncludes: {
    "/api/reingest": ["./text files/**"],
  },
  async headers() {
    return [
      {
        // Only mataitech.co (and local dev) may embed the widget
        source: "/widget",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "frame-ancestors 'self' https://mataitech.co https://www.mataitech.co https://*.vercel.app http://localhost:*",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
