import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default withSentryConfig(nextConfig, {
  // Use settings from environment variables (GitHub Actions, Vercel, etc.)
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Only print logs for uploading source maps in CI (like GitHub Actions)
  silent: !process.env.CI,

  // Upload more source maps for better error messages (takes longer to build)
  widenClientFileUpload: true,

  // Remove unnecessary Sentry logs to make your app smaller
  disableLogger: true,

  // Automatically set up Vercel Cron Monitors (not needed for now, but okay to keep)
  automaticVercelMonitors: true,
});