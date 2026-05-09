import type { Metadata } from "next";
import { PlayerCard } from "@/components/public/PlayerCard";
import { SectionHeader } from "@/components/public/SectionHeader";
import { getActivePlayers } from "@/services/playerService";
import { POSITION_LABELS } from "@/lib/utils";
import type { PlayerPosition } from "@/types";

export const metadata: Metadata = {
  title: "Futbolcular",
  description: `${process.env.NEXT_PUBLIC_CLUB_NAME || "Konyaspor"} futbol kadrosu.`,
};

export const revalidate = 600;
export const dynamic = "force-dynamic";

const POSITIONS: { value: PlayerPosition; label: string }[] = [
  { value: "goalkeeper", label: "Kaleciler" },
  { value: "defender", label: "Defanslar" },
  { value: "midfielder", label: "Orta Sahalar" },
  { value: "forward", label: "Forvetler" },
];

export default async function PlayersPage() {
  const players = await getActivePlayers({ limit: 50 });

  const grouped = POSITIONS.map((pos) => ({
    ...pos,
    players: players.filter((p) => p.position === pos.value),
  })).filter((g) => g.players.length > 0);

  return (
    <div className="min-h-screen pt-24 pb-16 bg-primary-950">
      <div className="container mx-auto px-4">
        <SectionHeader
          title="Futbol Kadrosu"
          subtitle={`${players.length} aktif futbolcu`}
          accent
        />

        {players.length === 0 ? (
          <div className="text-center py-20 text-primary-400">
            Kadro bilgisi henüz eklenmedi.
          </div>
        ) : (
          <div className="space-y-12">
            {grouped.map((group) => (
              <section key={group.value}>
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="w-8 h-1 bg-accent-500 rounded-full" />
                  {group.label}
                  <span className="text-primary-400 text-sm font-normal">
                    ({group.players.length})
                  </span>
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {group.players.map((player) => (
                    <PlayerCard key={player.id} player={player} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
