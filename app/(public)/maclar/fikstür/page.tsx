import type { Metadata } from "next";
import { MatchCard } from "@/components/public/MatchCard";
import { SectionHeader } from "@/components/public/SectionHeader";
import { getAllMatchesAdmin } from "@/services/matchService";

export const metadata: Metadata = {
  title: "Fikstür",
  description: `${process.env.NEXT_PUBLIC_CLUB_NAME || "Konyaspor"} 2024-2025 sezonu fikstürü.`,
};

export const revalidate = 300;
export const dynamic = "force-dynamic";

export default async function FixturePage() {
  const matches = await getAllMatchesAdmin({ limit: 50, season: "2024-2025" });

  const upcoming = matches.filter((m) => m.status === "scheduled" || m.status === "live");
  const finished = matches.filter((m) => m.status === "finished");

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <SectionHeader
          title="Fikstür"
          subtitle="2024-2025 Sezonu"
          accent
        />

        {matches.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            Henüz maç eklenmedi.
          </div>
        ) : (
          <div className="space-y-12">
            {upcoming.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold mb-4 text-muted-foreground uppercase tracking-wider text-sm">
                  Yaklaşan Maçlar
                </h2>
                <div className="space-y-3">
                  {upcoming.map((match) => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                </div>
              </section>
            )}

            {finished.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold mb-4 text-muted-foreground uppercase tracking-wider text-sm">
                  Geçmiş Maçlar
                </h2>
                <div className="space-y-3">
                  {finished.map((match) => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
