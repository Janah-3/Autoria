process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: false,
};

export default nextConfig;