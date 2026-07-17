import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/integritet", "/villkor"],
        disallow: ["/api/", "/hem", "/admin", "/konto", "/installningar"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
