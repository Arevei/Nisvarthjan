"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { language, setLanguage, t } = useLanguage();
  const { user } = useAuth();

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        <Link href="/" className="flex items-center">
          <Image
            src="/brand/navbar-logo.png"
            alt="Nisvarthjan Seva Foundation"
            width={270}
            height={70}
            priority
            className="h-16 w-auto"
          />
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <Link href="/about" className="text-sm font-medium transition-colors hover:text-primary">
            {t("About Us", "About Us")}
          </Link>
          <Link href="/services" className="text-sm font-medium transition-colors hover:text-primary">
            {t("Programs", "Programs")}
          </Link>
          <Link href="/campaigns" className="text-sm font-medium transition-colors hover:text-primary">
            {t("Campaigns", "Campaigns")}
          </Link>
          <Link href="/news" className="text-sm font-medium transition-colors hover:text-primary">
            {t("News", "News")}
          </Link>
          <Link href="/contact" className="text-sm font-medium transition-colors hover:text-primary">
            {t("Contact", "Contact")}
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setLanguage(language === "en" ? "hi" : "en")}
            className="text-sm font-medium hover:text-primary"
          >
            {language === "hi" ? "English" : "Hindi"}
          </button>
          {user ? (
            <Link href="/dashboard" className="text-sm font-medium hover:text-primary">
              {t("Dashboard", "Dashboard")}
            </Link>
          ) : (
            <Link href="/login" className="text-sm font-medium hover:text-primary">
              {t("Login", "Login")}
            </Link>
          )}
          <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href="/donate">{t("Donate Now", "Donate Now")}</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}
