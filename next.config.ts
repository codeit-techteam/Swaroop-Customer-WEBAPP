import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
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
