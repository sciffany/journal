import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/movies",
        destination: "/ratings",
        permanent: true,
      },
      {
        source: "/movies/:path*",
        destination: "/ratings/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
