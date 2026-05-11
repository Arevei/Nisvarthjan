"use client";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { language, setLanguage, t } = useLanguage();
  const { user } = useAuth();

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-serif text-xl font-bold text-primary">
            {t("Nisvarthjan Seva", "निस्वार्थजन सेवा")}
          </span>
        </Link>
        <div className="hidden md:flex gap-6 items-center">
          <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors">
            {t("About Us", "हमारे बारे में")}
          </Link>
          <Link href="/services" className="text-sm font-medium hover:text-primary transition-colors">
            {t("Programs", "कार्यक्रम")}
          </Link>
          <Link href="/campaigns" className="text-sm font-medium hover:text-primary transition-colors">
            {t("Campaigns", "अभियान")}
          </Link>
          <Link href="/news" className="text-sm font-medium hover:text-primary transition-colors">
            {t("News", "समाचार")}
          </Link>
          <Link href="/contact" className="text-sm font-medium hover:text-primary transition-colors">
            {t("Contact", "संपर्क")}
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setLanguage(language === "en" ? "hi" : "en")}
            className="text-sm font-medium hover:text-primary"
          >
            {language === "hi" ? "English" : "हिंदी"}
          </button>
          {/* {user ? (
            <Link href="/dashboard" className="text-sm font-medium hover:text-primary">
              {t("Dashboard", "डैशबोर्ड")}
            </Link>
          ) : (
            <Link href="/login" className="text-sm font-medium hover:text-primary">
              {t("Login", "लॉग इन")}
            </Link>
          )} */}
          <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href="/donate">{t("Donate Now", "अभी दान करें")}</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}




