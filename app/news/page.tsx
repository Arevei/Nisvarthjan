"use client";
import { Layout } from "@/components/layout/Layout";
import { useLanguage } from "@/lib/language-context";
import { useListNews } from "@/lib/api-client/api";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

const toPreviewText = (input: string) =>
  input
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export default function News() {
  const { t, language } = useLanguage();
  const { data: news, isLoading } = useListNews();

  return (
    <Layout>
      <div className="bg-primary/5 py-12 md:py-20 border-b">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4">
            {t("News & Updates", "समाचार और अपडेट")}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-serif">
            {t(
              "Stay updated with our latest initiatives, events, and impact stories.",
              "हमारी नवीनतम पहलों, घटनाओं और प्रभाव की कहानियों से अपडेट रहें।"
            )}
          </p>
        </div>
      </div>
      <div className="container mx-auto px-4 py-16">
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col space-y-3">
                <Skeleton className="h-48 w-full rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : news && news.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {news.map((article) => (
              <Link key={article.id} href={`/news/${article.id}`}>
                <div className="bg-card rounded-2xl border overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer h-full flex flex-col">
                  {article.imageUrl && (
                    <div className="aspect-[4/3] overflow-hidden">
                      <img 
                        src={article.imageUrl} 
                        alt={article.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <span className="text-primary font-medium">{article.category}</span>
                      <span>•</span>
                      <span>{format(new Date(article.publishedAt), "MMM d, yyyy")}</span>
                    </div>
                    <h3 className="text-xl font-bold font-serif mb-3 group-hover:text-primary transition-colors line-clamp-2">
                      {language === "hi" && article.titleHindi ? article.titleHindi : article.title}
                    </h3>
                    <p className="text-muted-foreground line-clamp-3 mb-4 flex-1">
                      {toPreviewText(language === "hi" && article.contentHindi ? article.contentHindi : article.content)}
                    </p>
                    <div className="text-primary font-medium text-sm">
                      {t("Read more →", "और पढ़ें →")}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-card rounded-2xl border border-dashed">
            <div className="text-6xl mb-4 text-muted-foreground/30">📰</div>
            <h3 className="text-2xl font-serif font-bold mb-2">{t("No news yet", "अभी कोई समाचार नहीं")}</h3>
            <p className="text-muted-foreground">
              {t("Check back later for updates on our work.", "हमारे काम के अपडेट के लिए बाद में वापस आएं।")}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}




