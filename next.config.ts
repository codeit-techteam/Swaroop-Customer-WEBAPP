import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: "standalone",
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "pub-f184fe06f7d24c68978e25682f5fd785.r2.dev",
      },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts", "date-fns"],
  },
  async redirects() {
    return [
      {
        source: "/payments/invoices",
        destination: "/documents/invoices",
        permanent: false,
      },
      {
        source: "/documents/gst-invoices",
        destination: "/documents/invoices",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
