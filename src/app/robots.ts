import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  return {
    rules: {
      userAgent: "*",
      // Allow public authentication routes
      allow: ["/", "/login", "/register", "/api/auth/"],
      // Disallow all protected internal dashboard sectors from being crawled
      disallow: [
        "/dashboard",
        "/projects",
        "/calendar",
        "/team",
        "/settings",
        "/api/trpc/",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
