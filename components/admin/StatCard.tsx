import React from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: { value: number; label: string };
  color?: "green" | "blue" | "yellow" | "red" | "purple";
  loading?: boolean;
}

const COLOR_MAP = {
  green: {
    bg: "bg-green-900/30",
    icon: "bg-green-700/30 text-green-400",
    text: "text-green-400",
  },
  blue: {
    bg: "bg-blue-900/30",
    icon: "bg-blue-700/30 text-blue-400",
    text: "text-blue-400",
  },
  yellow: {
    bg: "bg-yellow-900/30",
    icon: "bg-yellow-700/30 text-yellow-400",
    text: "text-yellow-400",
  },
  red: {
    bg: "bg-red-900/30",
    icon: "bg-red-700/30 text-red-400",
    text: "text-red-400",
  },
  purple: {
    bg: "bg-purple-900/30",
    icon: "bg-purple-700/30 text-purple-400",
    text: "text-purple-400",
  },
};

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = "green",
  loading = false,
}: StatCardProps) {
  const colors = COLOR_MAP[color];

  if (loading) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <Skeleton className="h-4 w-24 mb-4 bg-gray-800" />
        <Skeleton className="h-8 w-16 mb-2 bg-gray-800" />
        <Skeleton className="h-3 w-32 bg-gray-800" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "bg-gray-900 border border-gray-800 rounded-xl p-5 transition-all duration-200 hover:border-gray-700",
        colors.bg
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <p className="text-sm text-gray-400 font-medium">{title}</p>
        <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", colors.icon)}>
          {icon}
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-3xl font-bold text-white tabular-nums">{value}</p>
        {subtitle && (
          <p className="text-xs text-gray-500">{subtitle}</p>
        )}
        {trend && (
          <p className={cn("text-xs font-medium", trend.value >= 0 ? "text-green-400" : "text-red-400")}>
            {trend.value >= 0 ? "+" : ""}{trend.value}% {trend.label}
          </p>
        )}
      </div>
    </div>
  );
}
