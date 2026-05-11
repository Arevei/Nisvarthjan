"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Layout } from "@/components/layout/Layout";
import { useLanguage } from "@/lib/language-context";
import { useGetNewsArticle, getGetNewsArticleQueryKey } from "@/lib/api-client/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, User } from "lucide-react";

export default function NewsDetail() {
  const { t } = useLanguage();
  const params = useParams<{ id: string }>();
  const id = parseInt(params?.id ?? "0");

  const { data: article, isLoading } = useGetNewsArticle(id, {
    query: { enabled: !!id, queryKey: getGetNewsArticleQueryKey(id) },
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="animate-pulse space-y-4 max-w-2xl mx-auto">
            <div className="h-8 bg-muted rounded w-3/4 mx-auto" />
            <div className="h-4 bg-muted rounded w-1/2 mx-auto" />
            <div className="h-64 bg-muted rounded" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!article) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">{t("Article not found", "लेख नहीं मिला")}</h1>
          <Button asChild><Link href="/news">{t("Back to News", "समाचार पर वापस जाएं")}</Link></Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <Button variant="ghost" asChild className="mb-6 text-primary hover:text-primary/80">
          <Link href="/news">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("Back to News", "समाचार पर वापस")}
          </Link>
        </Button>

        {article.imageUrl && (
          <div className="w-full h-72 rounded-xl overflow-hidden mb-8">
            <img src={article.imageUrl} alt={t(article.title, article.titleHindi)} className="w-full h-full object-cover" />
          </div>
        )}

        <Badge className="mb-4 bg-primary/10 text-primary border-0 capitalize">{article.category}</Badge>

        <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
          {t(article.title, article.titleHindi)}
        </h1>

        <div className="flex items-center gap-6 text-muted-foreground text-sm mb-8 pb-8 border-b">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {new Date(article.publishedAt).toLocaleDateString("hi-IN", { year: "numeric", month: "long", day: "numeric" })}
          </div>
          {article.author && (
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              {article.author}
            </div>
          )}
        </div>

        <div className="prose prose-lg max-w-none text-foreground leading-relaxed">
          {t(article.content, article.contentHindi)
            .split("\n")
            .map((para, i) => (
              <p key={i} className="mb-4">{para}</p>
            ))}
        </div>
      </div>
    </Layout>
  );
}






