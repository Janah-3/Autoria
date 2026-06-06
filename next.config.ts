process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
};

export default withNextIntl(nextConfig);