"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";
import "next-google-translate-widget/styles";
import { ChevronDown, Languages } from "lucide-react";

type NewsItem = {
  id: number;
  title: string;
  titleHindi?: string | null;
};

export function NewsTicker() {
  const { language, setLanguage, t } = useLanguage();
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

  const hasNews = !loading && news.length > 0;
  const items = hasNews ? [...news, ...news] : [];

  return (
    <div className="bg-gradient-to-r from-primary via-primary to-primary/90 text-primary-foreground">
      <div>
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between">
          <div className="flex items-center min-w-0 border-b lg:border-b-0 lg:border-r border-primary-foreground/20">
            {hasNews && (
              <div className="flex shrink-0 items-center gap-2 bg-primary-foreground/15 px-4 py-2.5">
                <span className="text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                  {t("News", "समाचार")}
                </span>
              </div>
            )}

            <div className="relative flex-1 min-w-0 overflow-hidden py-2.5">
              {hasNews ? (
                <div className="animate-marquee flex whitespace-nowrap">
                  {items.map((item, idx) => (
                    <span key={`${item.id}-${idx}`} className="mx-6 inline-flex items-center gap-3 text-sm">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary-foreground/50" />
                      <Link
                        href="/news"
                        className="truncate max-w-[200px] lg:max-w-xs hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {language === "hi" && item.titleHindi ? item.titleHindi : item.title}
                      </Link>
                    </span>
                  ))}
                </div>
              ) : (
               <div className="flex items-center px-4 text-sm">
                  <span className="text-primary-foreground/80">
                    {t("Welcome to Nisvarthjan Seva Foundation", "निःस्वार्थजन सेवा फाउंडेशन में आपका स्वागत है")}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 lg:gap-3 px-3 lg:px-4 py-2">
            <label className="flex items-center gap-2 px-2 lg:px-3 py-1.5 rounded-md text-xs lg:text-sm font-medium whitespace-nowrap bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground transition-colors">
              <Languages className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
              <span>{t("Change Language", "भाषा बदलें")}</span>
              <select
                value={language}
                onChange={(event) => setLanguage(event.target.value as "en" | "hi")}
                className="appearance-none bg-transparent pr-5 text-primary-foreground outline-none cursor-pointer"
                aria-label="Change language"
              >
                <option className="text-foreground" value="en">English</option>
                <option className="text-foreground" value="hi">Hindi</option>
              </select>
              <ChevronDown className="-ml-5 h-3.5 w-3.5 pointer-events-none" />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
