import type { Metadata } from "next";
import { Suspense } from "react";
import { NewsCard } from "@/components/public/NewsCard";
import { SectionHeader } from "@/components/public/SectionHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { getPublishedNews } from "@/services/newsService";
import type { NewsCategory } from "@/types";
import { CATEGORY_LABELS } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Haberler",
  description: `${process.env.NEXT_PUBLIC_CLUB_NAME || "Konyaspor"} son haberleri ve duyuruları.`,
};

export const revalidate = 300;
export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ kategori?: string; sayfa?: string }>;
}

export default async function NewsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const category = params.kategori as NewsCategory | undefined;
  const page = parseInt(params.sayfa || "1");
  const limit = 12;

  const articles = await getPublishedNews({
    limit,
    category: category || undefined,
  });

  const categories = Object.entries(CATEGORY_LABELS);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <SectionHeader
          title="Haberler"
          subtitle="Kulübümüzdeki tüm gelişmeler"
          accent
        />

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          <a
            href="/haberler"
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              !category
                ? "bg-primary-700 text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Tümü
          </a>
          {categories.map(([value, label]) => (
            <a
              key={value}
              href={`/haberler?kategori=${value}`}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                category === value
                  ? "bg-primary-700 text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {label}
            </a>
          ))}
        </div>

        {/* Articles grid */}
        {articles.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg">Bu kategoride haber bulunamadı.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
