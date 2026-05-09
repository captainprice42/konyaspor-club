import type { Metadata } from "next";
import { HeroSection } from "@/components/public/HeroSection";
import { SectionHeader } from "@/components/public/SectionHeader";
import { NewsCard } from "@/components/public/NewsCard";
import { PlayerCard } from "@/components/public/PlayerCard";
import { MatchCard } from "@/components/public/MatchCard";
import { StandingsTable } from "@/components/public/StandingsTable";
import { getPublishedNews } from "@/services/newsService";
import { getActivePlayers } from "@/services/playerService";
import { getUpcomingMatches, getRecentMatches } from "@/services/matchService";
import { getStandings } from "@/services/standingsService";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Ana Sayfa",
  description: `${process.env.NEXT_PUBLIC_CLUB_NAME || "Konyaspor"} resmi web sitesi. Son haberler, maç sonuçları ve kadro bilgileri.`,
};

// ISR — revalidate every 5 minutes
export const revalidate = 300;
export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Parallel data fetching for performance
  const [featuredNews, players, upcomingMatches, recentMatches, standings] =
    await Promise.allSettled([
      getPublishedNews({ limit: 7, featured: true }),
      getActivePlayers({ limit: 8 }),
      getUpcomingMatches({ limit: 3 }),
      getRecentMatches({ limit: 3 }),
      getStandings({ season: "2024-2025", limit: 10 }),
    ]);

  const news = featuredNews.status === "fulfilled" ? featuredNews.value : [];
  const squad = players.status === "fulfilled" ? players.value : [];
  const upcoming = upcomingMatches.status === "fulfilled" ? upcomingMatches.value : [];
  const recent = recentMatches.status === "fulfilled" ? recentMatches.value : [];
  const table = standings.status === "fulfilled" ? standings.value : [];

  const [featuredArticle, ...restNews] = news;

  return (
    <>
      {/* Hero */}
      <HeroSection />

      {/* Latest News */}
      <section className="py-16 bg-background" aria-labelledby="news-heading">
        <div className="container mx-auto px-4">
          <SectionHeader
            title="Son Haberler"
            subtitle="Kulübümüzdeki en güncel gelişmeler"
            viewAllHref="/haberler"
            accent
          />
          {news.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Henüz haber bulunmuyor.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Featured article */}
              {featuredArticle && (
                <div className="lg:col-span-2">
                  <NewsCard article={featuredArticle} variant="featured" />
                </div>
              )}
              {/* Side articles */}
              <div className="space-y-4">
                {restNews.slice(0, 4).map((article) => (
                  <NewsCard key={article.id} article={article} variant="horizontal" />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Matches section */}
      <section className="py-16 bg-muted/30" aria-labelledby="matches-heading">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Upcoming matches */}
            <div>
              <SectionHeader
                title="Yaklaşan Maçlar"
                viewAllHref="/maclar/fikstür"
                accent
              />
              {upcoming.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground rounded-xl border border-dashed">
                  Planlanmış maç bulunmuyor.
                </div>
              ) : (
                <div className="space-y-4">
                  {upcoming.map((match) => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                </div>
              )}
            </div>

            {/* Recent results */}
            <div>
              <SectionHeader
                title="Son Sonuçlar"
                viewAllHref="/maclar/sonuclar"
                accent
              />
              {recent.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground rounded-xl border border-dashed">
                  Henüz maç oynanmadı.
                </div>
              ) : (
                <div className="space-y-4">
                  {recent.map((match) => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Squad */}
      <section className="py-16 bg-primary-950" aria-labelledby="squad-heading">
        <div className="container mx-auto px-4">
          <SectionHeader
            title="Kadromuz"
            subtitle="Bu sezon formumuzu giyen futbolcularımız"
            viewAllHref="/kadro/futbolcular"
            viewAllLabel="Tüm Kadro"
            accent
          />
          {squad.length === 0 ? (
            <div className="text-center py-12 text-primary-400">
              Kadro bilgisi henüz eklenmedi.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
              {squad.map((player) => (
                <PlayerCard key={player.id} player={player} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Standings */}
      <section className="py-16 bg-background" aria-labelledby="standings-heading">
        <div className="container mx-auto px-4">
          <SectionHeader
            title="Puan Durumu"
            subtitle="2024-2025 Sezonu Lig Tablosu"
            viewAllHref="/maclar/puan-durumu"
            accent
          />
          <StandingsTable
            standings={table}
            highlightTeam={process.env.NEXT_PUBLIC_CLUB_NAME || "Konyaspor"}
          />
        </div>
      </section>
    </>
  );
}
