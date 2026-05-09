import React from "react";
import Link from "next/link";
import Image from "next/image";
import { User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn, POSITION_LABELS, POSITION_SHORT } from "@/lib/utils";
import type { Player } from "@/types";

interface PlayerCardProps {
  player: Player;
  className?: string;
}

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-500",
  injured: "bg-red-500",
  suspended: "bg-yellow-500",
  loaned: "bg-blue-500",
};

const STATUS_LABELS: Record<string, string> = {
  active: "Aktif",
  injured: "Sakatlık",
  suspended: "Cezalı",
  loaned: "Kiralık",
};

export function PlayerCard({ player, className }: PlayerCardProps) {
  return (
    <Link href={`/kadro/futbolcular/${player.slug}`} className="group block">
      <div
        className={cn(
          "relative overflow-hidden rounded-xl bg-gradient-to-b from-primary-800 to-primary-950",
          "border border-primary-700/30 transition-all duration-300",
          "hover:shadow-xl hover:shadow-primary-900/50 hover:-translate-y-1",
          className
        )}
      >
        {/* Jersey number */}
        <div className="absolute top-3 left-3 z-10">
          <div className="w-8 h-8 bg-accent-500 rounded-lg flex items-center justify-center">
            <span className="text-black font-bold text-sm">{player.number}</span>
          </div>
        </div>

        {/* Status indicator */}
        {player.status !== "active" && (
          <div className="absolute top-3 right-3 z-10">
            <span
              className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white",
                STATUS_COLORS[player.status]
              )}
            >
              {STATUS_LABELS[player.status]}
            </span>
          </div>
        )}

        {/* Player photo */}
        <div className="relative h-56 overflow-hidden">
          {player.photo ? (
            <Image
              src={player.photo}
              alt={player.name}
              fill
              className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary-900">
              <User className="w-20 h-20 text-primary-700" />
            </div>
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-primary-950 via-transparent to-transparent" />
        </div>

        {/* Player info */}
        <div className="p-4">
          {/* Nationality flag */}
          {player.nationalityFlag && (
            <span className="text-lg mr-1" aria-label={player.nationality}>
              {player.nationalityFlag}
            </span>
          )}
          <h3 className="font-bold text-white text-lg leading-tight mt-1 group-hover:text-accent-400 transition-colors">
            {player.name}
          </h3>
          <div className="flex items-center justify-between mt-2">
            <span className="text-primary-300 text-sm">
              {POSITION_LABELS[player.position] || player.position}
            </span>
            <div className="w-7 h-7 bg-primary-700/50 rounded-md flex items-center justify-center">
              <span className="text-xs font-bold text-primary-300">
                {POSITION_SHORT[player.position] || "?"}
              </span>
            </div>
          </div>

          {/* Stats preview */}
          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-primary-700/30">
            {[
              { label: "Maç", value: player.stats.appearances },
              { label: "Gol", value: player.stats.goals },
              { label: "Asist", value: player.stats.assists },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-white font-bold text-sm">{stat.value}</div>
                <div className="text-primary-400 text-xs">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
