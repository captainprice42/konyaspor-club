import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  className?: string;
  centered?: boolean;
  accent?: boolean;
}

export function SectionHeader({
  title,
  subtitle,
  viewAllHref,
  viewAllLabel = "Tümünü Gör",
  className,
  centered = false,
  accent = false,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-end justify-between mb-8",
        centered && "flex-col items-center text-center",
        className
      )}
    >
      <div className={cn(centered && "mb-4")}>
        {accent && (
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-1 bg-accent-500 rounded-full" />
            <div className="w-4 h-1 bg-accent-500/50 rounded-full" />
          </div>
        )}
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h2>
        {subtitle && (
          <p className="text-muted-foreground mt-1.5 text-sm md:text-base max-w-2xl">
            {subtitle}
          </p>
        )}
      </div>

      {viewAllHref && (
        <Link
          href={viewAllHref}
          className="flex items-center gap-1 text-sm font-medium text-primary-700 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 transition-colors whitespace-nowrap ml-4 group"
        >
          {viewAllLabel}
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      )}
    </div>
  );
}
