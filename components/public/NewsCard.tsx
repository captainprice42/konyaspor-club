import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Eye, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn, formatRelativeTime, truncate, CATEGORY_LABELS } from "@/lib/utils";
import type { NewsArticle } from "@/types";

interface NewsCardProps {
  article: NewsArticle;
  variant?: "default" | "featured" | "compact" | "horizontal";
  className?: string;
}

export function NewsCard({
  article,
  variant = "default",
  className,
}: NewsCardProps) {
  const categoryLabel = CATEGORY_LABELS[article.category] || article.category;

  if (variant === "horizontal") {
    return (
      <Link href={`/haberler/${article.slug}`} className="group block">
        <Card
          className={cn(
            "overflow-hidden transition-all duration-300 hover:shadow-md",
            className
          )}
        >
          <div className="flex gap-4 p-4">
            {article.coverImage && (
              <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                <Image
                  src={article.coverImage}
                  alt={article.coverImageAlt || article.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="96px"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <Badge variant="default" className="mb-2 text-xs">
                {categoryLabel}
              </Badge>
              <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors">
                {article.title}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {formatRelativeTime(article.publishedAt)}
              </p>
            </div>
          </div>
        </Card>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link href={`/haberler/${article.slug}`} className="group block">
        <div
          className={cn(
            "flex items-start gap-3 py-3 border-b border-border last:border-0",
            className
          )}
        >
          <div className="w-1 h-full min-h-[40px] bg-primary-700 rounded-full flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium leading-snug line-clamp-2 group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors">
              {article.title}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {formatRelativeTime(article.publishedAt)}
            </p>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "featured") {
    return (
      <Link href={`/haberler/${article.slug}`} className="group block h-full">
        <Card
          className={cn(
            "overflow-hidden h-full transition-all duration-300 hover:shadow-xl",
            className
          )}
        >
          <div className="relative aspect-[16/9] overflow-hidden">
            {article.coverImage ? (
              <Image
                src={article.coverImage}
                alt={article.coverImageAlt || article.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary-700 to-primary-900 flex items-center justify-center">
                <Tag className="w-12 h-12 text-white/30" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <Badge variant="accent" className="mb-3">
                {categoryLabel}
              </Badge>
              <h2 className="text-xl font-bold text-white leading-tight line-clamp-2 mb-2">
                {article.title}
              </h2>
              <p className="text-white/70 text-sm line-clamp-2">
                {article.excerpt}
              </p>
              <div className="flex items-center gap-4 mt-3 text-white/50 text-xs">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatRelativeTime(article.publishedAt)}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {article.viewCount} görüntülenme
                </span>
              </div>
            </div>
          </div>
        </Card>
      </Link>
    );
  }

  // Default card
  return (
    <Link href={`/haberler/${article.slug}`} className="group block h-full">
      <Card
        className={cn(
          "overflow-hidden h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
          className
        )}
      >
        <div className="relative aspect-[16/9] overflow-hidden">
          {article.coverImage ? (
            <Image
              src={article.coverImage}
              alt={article.coverImageAlt || article.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-700 to-primary-900 flex items-center justify-center">
              <Tag className="w-8 h-8 text-white/30" />
            </div>
          )}
          {article.featured && (
            <div className="absolute top-3 left-3">
              <Badge variant="accent">Öne Çıkan</Badge>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <Badge variant="default" className="mb-2 text-xs">
            {categoryLabel}
          </Badge>
          <h3 className="font-semibold leading-snug line-clamp-2 mb-2 group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors">
            {article.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {article.excerpt}
          </p>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatRelativeTime(article.publishedAt)}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {article.viewCount}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
