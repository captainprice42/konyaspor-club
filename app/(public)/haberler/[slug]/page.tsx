import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Eye, Tag, ArrowLeft, Share2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getNewsBySlug, getPublishedNews, incrementViewCount } from "@/services/newsService";
import { NewsCard } from "@/components/public/NewsCard";
import { formatDate, formatRelativeTime, CATEGORY_LABELS } from "@/lib/utils";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getNewsBySlug(slug);
  if (!article) return { title: "Haber Bulunamadı" };

  return {
    title: article.seo?.title || article.title,
    description: article.seo?.description || article.excerpt,
    keywords: article.seo?.keywords || article.tags,
    openGraph: {
      title: article.seo?.title || article.title,
      description: article.seo?.description || article.excerpt,
      images: article.coverImage ? [{ url: article.coverImage }] : [],
      type: "article",
      publishedTime: article.publishedAt?.toDate().toISOString(),
    },
    robots: article.seo?.noIndex ? { index: false } : undefined,
  };
}

export const revalidate = 600;
export const dynamic = "force-dynamic";

export default async function NewsDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [article, related] = await Promise.all([
    getNewsBySlug(slug),
    getPublishedNews({ limit: 3, category: undefined }),
  ]);

  if (!article) notFound();

  // Increment view count (fire and forget)
  incrementViewCount(article.id).catch(() => {});

  const relatedArticles = related.filter((a) => a.id !== article.id).slice(0, 3);

  return (
    <article className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back */}
        <Link
          href="/haberler"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Tüm Haberler
        </Link>

        {/* Header */}
        <header className="mb-8">
          <Badge variant="default" className="mb-4">
            {CATEGORY_LABELS[article.category] || article.category}
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
            {article.title}
          </h1>
          <p className="text-lg text-muted-foreground mb-6">{article.excerpt}</p>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {formatDate(article.publishedAt)}
            </span>
            <span className="flex items-center gap-1.5">
              <Eye className="w-4 h-4" />
              {article.viewCount} görüntülenme
            </span>
            <span>Yazar: {article.authorName}</span>
          </div>
        </header>

        {/* Cover image */}
        {article.coverImage && (
          <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-8">
            <Image
              src={article.coverImage}
              alt={article.coverImageAlt || article.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 800px"
              priority
            />
          </div>
        )}

        {/* Content */}
        <div
          className="prose prose-lg dark:prose-invert max-w-none mb-12
            prose-headings:font-bold prose-headings:text-foreground
            prose-p:text-foreground/80 prose-p:leading-relaxed
            prose-a:text-primary-600 dark:prose-a:text-primary-400
            prose-img:rounded-xl prose-img:shadow-md
            prose-blockquote:border-primary-600 prose-blockquote:bg-muted/50 prose-blockquote:rounded-r-lg prose-blockquote:py-1"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Tags */}
        {article.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-8 pt-6 border-t">
            <Tag className="w-4 h-4 text-muted-foreground" />
            {article.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Related articles */}
        {relatedArticles.length > 0 && (
          <section className="mt-12 pt-8 border-t">
            <h2 className="text-xl font-bold mb-6">İlgili Haberler</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedArticles.map((a) => (
                <NewsCard key={a.id} article={a} />
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
