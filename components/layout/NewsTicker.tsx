"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/language-context";

type NewsItem = {
  id: number;
  title: string;
  titleHindi?: string | null;
};

export function NewsTicker() {
  const { language, t } = useLanguage();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch("/api/news?limit=5");
        if (res.ok) {
          const data = await res.json();
          setNews(data);
        }
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  if (loading || news.length === 0) return null;

  // Duplicate items for seamless loop
  const items = [...news, ...news];

  return (
    <div className="bg-primary text-primary-foreground">
      <div className="container mx-auto flex h-10 items-center overflow-hidden">
        <div className="flex shrink-0 items-center gap-2 bg-primary-foreground/20 px-3 py-1.5">
          <span className="text-xs font-bold uppercase tracking-wider">{t("News", "समाचार")}</span>
        </div>
        <div className="relative flex-1 overflow-hidden">
          <div className="animate-marquee flex whitespace-nowrap">
            {items.map((item, idx) => (
              <span key={`${item.id}-${idx}`} className="mx-8 inline-flex items-center gap-2 text-sm">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary-foreground/60" />
                <span className="truncate max-w-xs">
                  {language === "hi" && item.titleHindi ? item.titleHindi : item.title}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}