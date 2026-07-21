import type { MetadataRoute } from "next";
import { services, siteConfig } from "@/lib/site-config";
import { getAllPosts } from "@/lib/blog/utils";

type RouteEntry = {
  route: string;
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;
  priority: number;
  lastModified?: Date;
};

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: RouteEntry[] = [
    { route: "", changeFrequency: "weekly", priority: 1 },
    { route: "/services", changeFrequency: "monthly", priority: 0.9 },
    { route: "/process", changeFrequency: "monthly", priority: 0.7 },
    { route: "/pricing", changeFrequency: "monthly", priority: 0.8 },
    { route: "/case-studies", changeFrequency: "weekly", priority: 0.7 },
    { route: "/blog", changeFrequency: "daily", priority: 0.8 },
    { route: "/contact", changeFrequency: "monthly", priority: 0.9 },
    { route: "/legal/privacy", changeFrequency: "yearly", priority: 0.3 },
    { route: "/legal/terms", changeFrequency: "yearly", priority: 0.3 },
    { route: "/legal/cookies", changeFrequency: "yearly", priority: 0.3 },
  ];

  const serviceRoutes: RouteEntry[] = services.map((service) => ({
    route: `/services/${service.slug}`,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const blogRoutes: RouteEntry[] = getAllPosts().map((post) => ({
    route: `/blog/${post.slug}`,
    changeFrequency: "monthly",
    priority: 0.6,
    lastModified: new Date(post.publishedAt),
  }));

  return [...staticRoutes, ...serviceRoutes, ...blogRoutes].map((entry) => ({
    url: `${siteConfig.url}${entry.route}`,
    lastModified: entry.lastModified ?? new Date(),
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));
}
