"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/language-context";
import "next-google-translate-widget/styles";
import { Languages,  Mail, Phone } from "lucide-react";

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

  // Show ticker only if there are news items
  const hasNews = !loading && news.length > 0;

  // Duplicate items for seamless loop
  const items = hasNews ? [...news, ...news] : [];

  return (
    <div className="bg-primary text-primary-foreground">
      <div className="container mx-auto flex h-10 items-center overflow-hidden">
        {/* News Label */}
        {hasNews && (
          <div className="flex shrink-0 items-center gap-2 bg-primary-foreground/20 px-3 py-1.5">
            <span className="text-xs font-bold uppercase tracking-wider">{t("News", "समाचार")}</span>
          </div>
        )}

        {/* Scrolling News */}
        <div className="relative flex-1 overflow-hidden">
          {hasNews ? (
            <div className="animate-marquee flex whitespace-nowrap">
              {items.map((item, idx) => (
                <span key={`${item.id}-${idx}`} className="mx-8 inline-flex items-center gap-2 text-sm">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary-foreground/60" />
                  <a 
                    href="/news" 
                    className="truncate max-w-xs hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {language === "hi" && item.titleHindi ? item.titleHindi : item.title}
                  </a>
                </span>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center gap-6 text-sm">
              <span className="text-primary-foreground/80">Welcome to Nisvarthjan Seva Foundation</span>
            </div>
          )}
        </div>

        {/* Contact Info & Google Translator */}
        <div className="flex shrink-0 items-center gap-3 bg-primary-foreground/20 pl-3 py-1.5">
          {/* Contact Phone */}
          <a 
            href="tel:+917380626179" 
            className="flex items-center gap-1.5 text-xs hover:text-primary-foreground/80 transition-colors"
            title="Call us"
          >
            <Phone className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">+91 73806 26179</span>
          </a>

          {/* Contact Email */}
          <a 
            href="mailto:nisvarthjansevango@gmail.com" 
            className="flex items-center gap-1.5 text-xs hover:text-primary-foreground/80 transition-colors"
            title="Email us"
          >
            <Mail className="h-3.5 w-3.5" />
            <span className="hidden md:inline">nisvarthjansevango@gmail.com</span>
          </a>

          {/* Google Translator */}
          <div className="border-l border-primary-foreground/30 ">
                  <button
                    type="button"
                    onClick={() => setLanguage(language === "en" ? "hi" : "en")}
                    className="flex min-h-12 items-center gap-3 rounded-lg border border-transparent   text-left text-sm font-semibold transition-colors hover:border-primary/20 bg-accent text-primary pr-4"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent text-primary">
                      <Languages className="h-4 w-4" />
                    </span>
                    {language === "hi" ? "English" : "Hindi"}
                  </button>
            {/* <GoogleTranslate 
              pageLanguage="en" 
              languages={[
    { label: "English", value: "en", flag: "us" },
    { label: "বাংলা",   value: "bn", flag: "bd" },
    { label: "हिंदी",   value: "hi", flag: "in" },
  ]}
              className="[--ngt-bg:rgba(255,255,255,0.95)] [--ngt-text:#1e3a5f] [--ngt-border:#e5e7eb] [--ngt-shadow:0_4px_12px_rgba(0,0,0,0.15)]" 
            /> */}
          </div>
        </div>
      </div>
    </div>
  );
}