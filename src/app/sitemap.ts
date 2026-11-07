import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-metadata";

export default function sitemap(): MetadataRoute.Sitemap {
  // Profiles are discovered via their shared URLs; account and redirect routes
  // are deliberately excluded from the sitemap.
  return [{ url: new URL("/", siteUrl).toString() }];
}
