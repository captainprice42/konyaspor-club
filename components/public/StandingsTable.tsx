import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { StandingEntry } from "@/types";

interface StandingsTableProps {
  standings: StandingEntry[];
  highlightTeam?: string;
  compact?: boolean;
}

const FORM_COLORS: Record<string, string> = {
  W: "bg-green-500 text-white",
  D: "bg-yellow-500 text-black",
  L: "bg-red-500 text-white",
};

export function StandingsTable({
  standings,
  highlightTeam,
  compact = false,
}: StandingsTableProps) {
  if (standings.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Puan durumu henüz güncellenmedi.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm" role="table" aria-label="Puan durumu tablosu">
        <thead>
          <tr className="bg-muted/50 border-b border-border">
            <th className="text-left px-3 py-3 font-semibold text-muted-foreground w-8">#</th>
            <th className="text-left px-3 py-3 font-semibold text-muted-foreground">Takım</th>
            <th className="text-center px-2 py-3 font-semibold text-muted-foreground">O</th>
            <th className="text-center px-2 py-3 font-semibold text-muted-foreground">G</th>
            <th className="text-center px-2 py-3 font-semibold text-muted-foreground">B</th>
            <th className="text-center px-2 py-3 font-semibold text-muted-foreground">M</th>
            {!compact && (
              <>
                <th className="text-center px-2 py-3 font-semibold text-muted-foreground">AG</th>
                <th className="text-center px-2 py-3 font-semibold text-muted-foreground">YG</th>
                <th className="text-center px-2 py-3 font-semibold text-muted-foreground">AV</th>
                <th className="text-center px-2 py-3 font-semibold text-muted-foreground hidden md:table-cell">
                  Form
                </th>
              </>
            )}
            <th className="text-center px-3 py-3 font-bold text-foreground">P</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((entry, index) => {
            const isHighlighted =
              highlightTeam && entry.teamName === highlightTeam;
            const isTop3 = entry.position <= 3;
            const isRelegation = entry.position >= standings.length - 2;

            return (
              <tr
                key={entry.id}
                className={cn(
                  "border-b border-border/50 last:border-0 transition-colors",
                  isHighlighted
                    ? "bg-primary-50 dark:bg-primary-950/50 font-semibold"
                    : "hover:bg-muted/30"
                )}
              >
                {/* Position */}
                <td className="px-3 py-3">
                  <div className="flex items-center justify-center">
                    <span
                      className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                        isTop3
                          ? "bg-primary-700 text-white"
                          : isRelegation
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          : "text-muted-foreground"
                      )}
                    >
                      {entry.position}
                    </span>
                  </div>
                </td>

                {/* Team */}
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    {entry.teamLogo ? (
                      <div className="relative w-6 h-6 flex-shrink-0">
                        <Image
                          src={entry.teamLogo}
                          alt={entry.teamName}
                          fill
                          className="object-contain"
                          sizes="24px"
                        />
                      </div>
                    ) : (
                      <div
                        className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0",
                          isHighlighted ? "bg-primary-700" : "bg-gray-400"
                        )}
                      >
                        {entry.teamName.charAt(0)}
                      </div>
                    )}
                    <span
                      className={cn(
                        "truncate max-w-[120px] md:max-w-none",
                        isHighlighted && "text-primary-700 dark:text-primary-400"
                      )}
                    >
                      {entry.teamName}
                    </span>
                  </div>
                </td>

                {/* Stats */}
                <td className="text-center px-2 py-3 text-muted-foreground">{entry.played}</td>
                <td className="text-center px-2 py-3 text-green-600 dark:text-green-400">{entry.won}</td>
                <td className="text-center px-2 py-3 text-yellow-600 dark:text-yellow-400">{entry.drawn}</td>
                <td className="text-center px-2 py-3 text-red-600 dark:text-red-400">{entry.lost}</td>

                {!compact && (
                  <>
                    <td className="text-center px-2 py-3 text-muted-foreground">{entry.goalsFor}</td>
                    <td className="text-center px-2 py-3 text-muted-foreground">{entry.goalsAgainst}</td>
                    <td className="text-center px-2 py-3 text-muted-foreground">
                      {entry.goalDifference > 0 ? `+${entry.goalDifference}` : entry.goalDifference}
                    </td>
                    <td className="text-center px-2 py-3 hidden md:table-cell">
                      <div className="flex items-center justify-center gap-0.5">
                        {entry.form.slice(-5).map((result, i) => (
                          <span
                            key={i}
                            className={cn(
                              "w-5 h-5 rounded-sm flex items-center justify-center text-xs font-bold",
                              FORM_COLORS[result]
                            )}
                            title={result === "W" ? "Galibiyet" : result === "D" ? "Beraberlik" : "Mağlubiyet"}
                          >
                            {result}
                          </span>
                        ))}
                      </div>
                    </td>
                  </>
                )}

                {/* Points */}
                <td className="text-center px-3 py-3">
                  <span className="font-bold text-base">{entry.points}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
