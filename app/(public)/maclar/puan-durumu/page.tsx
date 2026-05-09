import type { Metadata } from "next";
import { StandingsTable } from "@/components/public/StandingsTable";
import { SectionHeader } from "@/components/public/SectionHeader";
import { getStandings } from "@/services/standingsService";

export const metadata: Metadata = {
  title: "Puan Durumu",
  description: `${process.env.NEXT_PUBLIC_CLUB_NAME || "Konyaspor"} 2024-2025 sezonu puan durumu.`,
};

export const revalidate = 300;
export const dynamic = "force-dynamic";

export default async function StandingsPage() {
  const standings = await getStandings({ season: "2024-2025" });

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <SectionHeader
          title="Puan Durumu"
          subtitle="2024-2025 Sezonu Lig Tablosu"
          accent
        />
        <StandingsTable
          standings={standings}
          highlightTeam={process.env.NEXT_PUBLIC_CLUB_NAME || "Konyaspor"}
        />
        {standings.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-primary-700 inline-block" />
              Şampiyonlar Ligi
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
              Küme düşme
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
