import type { MetadataRoute } from "next";
import { getPublishedNews } from "@/services/newsService";
import { getActivePlayers } from "@/services/playerService";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://konyaspor.example.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/haberler`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
    { url: `${BASE_URL}/kadro/futbolcular`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/maclar/fikstür`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/maclar/puan-durumu`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/kadro/transferler`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/medya/fotograflar`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE_URL}/iletisim`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  try {
    const [articles, players] = await Promise.allSettled([
      getPublishedNews({ limit: 100 }),
      getActivePlayers({ limit: 50 }),
    ]);

    const newsRoutes: MetadataRoute.Sitemap =
      articles.status === "fulfilled"
        ? articles.value.map((article) => ({
            url: `${BASE_URL}/haberler/${article.slug}`,
            lastModified: article.updatedAt?.toDate() || new Date(),
            changeFrequency: "weekly" as const,
            priority: 0.7,
          }))
        : [];

    const playerRoutes: MetadataRoute.Sitemap =
      players.status === "fulfilled"
        ? players.value.map((player) => ({
            url: `${BASE_URL}/kadro/futbolcular/${player.slug}`,
            lastModified: player.updatedAt?.toDate() || new Date(),
            changeFrequency: "monthly" as const,
            priority: 0.6,
          }))
        : [];

    return [...staticRoutes, ...newsRoutes, ...playerRoutes];
  } catch {
    return staticRoutes;
  }
}
