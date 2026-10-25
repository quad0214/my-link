import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep metadata in <head> to avoid extension DOM injection in its hidden wrapper.
  // https://nextjs.org/docs/app/api-reference/config/next-config-js/htmlLimitedBots
  htmlLimitedBots: /.*/,
};

export default nextConfig;
