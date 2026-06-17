"use client";

import Link from "next/link";

import { Layout } from "@/components/layout/Layout";
import { Skeleton } from "@/components/ui/skeleton";
import { useListNews } from "@/lib/api-client/api";
import { useLanguage } from "@/lib/language-context";

const CATEGORY_LABELS: Record<string, { en: string; hi: string }> = {
  health: { en: "Health", hi: "स्वास्थ्य" },
  education: { en: "Education", hi: "शिक्षा" },
  environment: { en: "Environment", hi: "पर्यावरण" },
  women: { en: "Women", hi: "महिला सशक्तिकरण" },
  rural: { en: "Rural", hi: "ग्रामीण विकास" },
  disaster: { en: "Disaster", hi: "आपदा राहत" },
  general: { en: "General", hi: "सामान्य" },
};

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
      <div className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
            {t("News & Updates", "समाचार और अपडेट")}
          </h1>
          <p className="text-xl  max-w-2xl mx-auto font-serif">
            {t(
              "Stay updated with our latest initiatives, events, and impact stories.",
              "हमारी नवीनतम पहलों, घटनाओं और प्रभाव की कहानियों से अपडेट रहें।",
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
            {news.map((article) => {
              const category = CATEGORY_LABELS[article.category] ?? CATEGORY_LABELS.general;
              const preview = toPreviewText(
                language === "hi" && article.contentHindi ? article.contentHindi : article.content,
              );

              return (
                <Link key={article.id} href={`/news/${article.id}`}>
                  <div className="bg-card rounded-2xl border overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer h-full flex flex-col">
                    {article.imageUrl && (
                      <div className="aspect-[4/3] overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={article.imageUrl}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <span className="text-primary font-medium">{t(category.en, category.hi)}</span>
                        <span>•</span>
                        <span>
                          {new Date(article.publishedAt).toLocaleDateString(t("en-IN", "hi-IN"), {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold font-serif mb-3 group-hover:text-primary transition-colors line-clamp-2">
                        {language === "hi" && article.titleHindi ? article.titleHindi : article.title}
                      </h3>
                      <p className="text-muted-foreground line-clamp-3 mb-4 flex-1">{preview}</p>
                      <div className="text-primary font-medium text-sm">
                        {t("Read more →", "और पढ़ें →")}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-card rounded-2xl border border-dashed">
            <div className="text-6xl mb-4 text-muted-foreground/30">N</div>
            <h3 className="text-2xl font-serif font-bold mb-2">
              {t("No news yet", "अभी कोई समाचार नहीं")}
            </h3>
            <p className="text-muted-foreground">
              {t("Check back later for updates on our work.", "हमारे काम के अपडेट के लिए बाद में वापस आएं।")}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
