import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, MapPin, Tv } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn, formatDate, COMPETITION_LABELS } from "@/lib/utils";
import type { Match } from "@/types";

interface MatchCardProps {
  match: Match;
  className?: string;
  showDetails?: boolean;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: "default" | "success" | "warning" | "destructive" | "info" }
> = {
  scheduled: { label: "Planlandı", variant: "default" },
  live: { label: "CANLI", variant: "destructive" },
  finished: { label: "Tamamlandı", variant: "success" },
  postponed: { label: "Ertelendi", variant: "warning" },
  cancelled: { label: "İptal", variant: "destructive" },
};

export function MatchCard({ match, className, showDetails = true }: MatchCardProps) {
  const statusConfig = STATUS_CONFIG[match.status] || STATUS_CONFIG.scheduled;
  const isFinished = match.status === "finished";
  const isLive = match.status === "live";
  const clubName = process.env.NEXT_PUBLIC_CLUB_NAME || "Konyaspor";

  const isHomeTeam = match.homeTeam.name === clubName;
  const isAwayTeam = match.awayTeam.name === clubName;

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all duration-300 hover:shadow-md",
        isLive && "ring-2 ring-red-500 ring-offset-2",
        className
      )}
    >
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">
              {COMPETITION_LABELS[match.competition] || match.competition}
            </span>
            <span>·</span>
            <span>{match.season}</span>
            {match.matchday > 0 && (
              <>
                <span>·</span>
                <span>{match.matchday}. Hafta</span>
              </>
            )}
          </div>
          <Badge variant={statusConfig.variant as "default"} className="text-xs">
            {isLive && (
              <span className="w-1.5 h-1.5 bg-white rounded-full mr-1.5 animate-pulse" />
            )}
            {statusConfig.label}
          </Badge>
        </div>

        {/* Match content */}
        <div className="px-4 py-5">
          <div className="flex items-center justify-between gap-4">
            {/* Home team */}
            <div className="flex-1 flex flex-col items-center gap-2 text-center">
              <div className="w-14 h-14 relative">
                {match.homeTeam.logo ? (
                  <Image
                    src={match.homeTeam.logo}
                    alt={match.homeTeam.name}
                    fill
                    className="object-contain"
                    sizes="56px"
                  />
                ) : (
                  <div
                    className={cn(
                      "w-full h-full rounded-full flex items-center justify-center text-white font-bold text-lg",
                      isHomeTeam ? "bg-primary-700" : "bg-gray-400"
                    )}
                  >
                    {match.homeTeam.shortName.charAt(0)}
                  </div>
                )}
              </div>
              <span
                className={cn(
                  "text-sm font-semibold leading-tight",
                  isHomeTeam && "text-primary-700 dark:text-primary-400"
                )}
              >
                {match.homeTeam.name}
              </span>
            </div>

            {/* Score / VS */}
            <div className="flex flex-col items-center gap-1 min-w-[80px]">
              {isFinished || isLive ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-bold tabular-nums">
                      {match.score?.home ?? 0}
                    </span>
                    <span className="text-xl text-muted-foreground">-</span>
                    <span className="text-3xl font-bold tabular-nums">
                      {match.score?.away ?? 0}
                    </span>
                  </div>
                  {match.score?.halfTimeHome !== undefined && (
                    <span className="text-xs text-muted-foreground">
                      ({match.score.halfTimeHome} - {match.score.halfTimeAway})
                    </span>
                  )}
                </>
              ) : (
                <>
                  <span className="text-2xl font-bold text-muted-foreground">VS</span>
                  <span className="text-xs text-muted-foreground font-medium">
                    {formatDate(match.scheduledAt, "HH:mm")}
                  </span>
                </>
              )}
            </div>

            {/* Away team */}
            <div className="flex-1 flex flex-col items-center gap-2 text-center">
              <div className="w-14 h-14 relative">
                {match.awayTeam.logo ? (
                  <Image
                    src={match.awayTeam.logo}
                    alt={match.awayTeam.name}
                    fill
                    className="object-contain"
                    sizes="56px"
                  />
                ) : (
                  <div
                    className={cn(
                      "w-full h-full rounded-full flex items-center justify-center text-white font-bold text-lg",
                      isAwayTeam ? "bg-primary-700" : "bg-gray-400"
                    )}
                  >
                    {match.awayTeam.shortName.charAt(0)}
                  </div>
                )}
              </div>
              <span
                className={cn(
                  "text-sm font-semibold leading-tight",
                  isAwayTeam && "text-primary-700 dark:text-primary-400"
                )}
              >
                {match.awayTeam.name}
              </span>
            </div>
          </div>
        </div>

        {/* Footer details */}
        {showDetails && (
          <div className="px-4 py-2.5 bg-muted/30 border-t flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(match.scheduledAt, "dd MMM yyyy")}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDate(match.scheduledAt, "HH:mm")}
            </span>
            {match.venue && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {match.venue}
              </span>
            )}
            {match.broadcastInfo && (
              <span className="flex items-center gap-1">
                <Tv className="w-3 h-3" />
                {match.broadcastInfo}
              </span>
            )}
            {match.ticketUrl && match.status === "scheduled" && (
              <a
                href={match.ticketUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto text-primary-600 dark:text-primary-400 hover:underline font-medium"
              >
                Bilet Al →
              </a>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
