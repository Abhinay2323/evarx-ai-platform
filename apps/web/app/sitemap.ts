import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { solutions } from "@/lib/solutions";
import { posts } from "@/lib/posts";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.url;
  const now = new Date().toISOString();
  const staticRoutes = [
    "",
    "/platform",
    "/custom-slm",
    "/solutions",
    "/agents",
    "/pricing",
    "/security",
    "/resources",
    "/company",
    "/demo",
    "/docs",
    "/status",
    "/privacy",
    "/terms",
    "/dpa"
  ];

  return [
    ...staticRoutes.map((p) => ({
      url: `${base}${p || "/"}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: p === "" ? 1 : 0.7
    })),
    ...solutions.map((s) => ({
      url: `${base}/solutions/${s.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6
    })),
    ...posts.map((p) => ({
      url: `${base}/resources/${p.slug}`,
      lastModified: p.date,
      changeFrequency: "monthly" as const,
      priority: 0.5
    }))
  ];
}
