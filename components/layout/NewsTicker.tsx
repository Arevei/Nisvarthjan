"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/language-context";
import "next-google-translate-widget/styles";
import { Languages, Mail, Phone } from "lucide-react";

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
    <div className="bg-gradient-to-r from-primary via-primary to-primary/90 text-primary-foreground">
      <div className="">
        {/* Main Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between">
          
          {/* Left Section: News Ticker */}
          <div className="flex items-center min-w-0 border-b lg:border-b-0 lg:border-r border-primary-foreground/20">
            
            {/* News Label */}
            {hasNews && (
              <div className="flex shrink-0 items-center gap-2 bg-primary-foreground/15 px-4 py-2.5">
                <span className="text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                  {t("News", "समाचार")}
                </span>
              </div>
            )}

            {/* Scrolling News */}
            <div className="relative flex-1 min-w-0 overflow-hidden py-2.5">
              {hasNews ? (
                <div className="animate-marquee flex whitespace-nowrap">
                  {items.map((item, idx) => (
                    <span key={`${item.id}-${idx}`} className="mx-6 inline-flex items-center gap-3 text-sm">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary-foreground/50" />
                      <a 
                        href="/news" 
                        className="truncate max-w-[200px] lg:max-w-xs hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {language === "hi" && item.titleHindi ? item.titleHindi : item.title}
                      </a>
                    </span>
                  ))}
                </div>
              ) : (
                <div className="flex items-center px-4 text-sm">
                  <span className="text-primary-foreground/80">Welcome to Nisvarthjan Seva Foundation</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Section: Contact Info & Language */}
          <div className="flex items-center gap-1 lg:gap-3 px-3 lg:px-4 py-2 ">
            
            {/* Contact Phone */}
            <a 
              href="tel:+917380626179" 
              className="flex items-center gap-1.5 lg:gap-2 text-xs lg:text-sm whitespace-nowrap hover:text-primary-foreground/70 transition-colors"
              title="Call us"
            >
              <Phone className="h-3.5 w-3.5 lg:h-4 lg:w-4 shrink-0" />
              <span className="hidden sm:inline">+91 73806 26179</span>
            </a>

            <div className="h-4 w-px bg-primary-foreground/20 hidden sm:block" />

            {/* Contact Email - Desktop */}
            <a 
              href="https://mail.google.com/mail/u/0/?to=nisvarthjansevango@gmail.com&su=Niswarthjan+Seva+Foundation+Inquiry&fs=1&tf=cm" 
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-1.5 lg:gap-2 text-xs lg:text-sm whitespace-nowrap hover:text-primary-foreground/70 transition-colors"
              title="Email us"
            >
              <Mail className="h-3.5 w-3.5 lg:h-4 lg:w-4 shrink-0" />
              <span className="hidden lg:inline">nisvarthjansevango@gmail.com</span>
            </a>

            {/* Contact Email - Mobile */}
            <a 
              href="mailto:nisvarthjansevango@gmail.com?subject=Niswarthjan+Seva+Foundation+Inquiry" 
              className="md:hidden flex items-center gap-1.5 text-xs whitespace-nowrap hover:text-primary-foreground/70 transition-colors"
              title="Email us"
            >
              <Mail className="h-3.5 w-3.5 shrink-0" />
            </a>

            <div className="h-4 w-px bg-primary-foreground/20" />

            {/* Language Toggle */}
            <button
              type="button"
              onClick={() => setLanguage(language === "en" ? "hi" : "en")}
              className="flex items-center gap-2 px-2 lg:px-3 py-1.5 rounded-md text-xs lg:text-sm font-medium whitespace-nowrap bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground transition-colors"
            >
              <Languages className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
              <span>{language === "hi" ? "EN" : "हिंदी"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}