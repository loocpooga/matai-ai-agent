import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Bundle the knowledge base .txt files with the chat function:
  // the whole KB ships inside Fin's prompt, no database involved
  outputFileTracingIncludes: {
    "/api/chat": ["./text files/**"],
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
