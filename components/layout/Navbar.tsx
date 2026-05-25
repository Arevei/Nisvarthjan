"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";

type MemberMessage = {
  id: number;
  title: string;
  message: string;
  createdAt: string;
};

export function Navbar() {
  const { language, setLanguage, t } = useLanguage();
  const { user } = useAuth();
  const [memberMessage, setMemberMessage] = useState<MemberMessage | null>(null);
  const [messageOpen, setMessageOpen] = useState(false);
  const [messageDismissed, setMessageDismissed] = useState(true);
  const notificationRef = useRef<HTMLDivElement | null>(null);

  const dismissMessage = useCallback(() => {
    if (memberMessage && typeof window !== "undefined") {
      window.localStorage.setItem("nsf_latest_member_message_id", String(memberMessage.id));
    }
    setMessageOpen(false);
    setMessageDismissed(true);
  }, [memberMessage]);

  useEffect(() => {
    let cancelled = false;

    const loadMemberMessage = async () => {
      try {
        const response = await fetch("/api/member-messages/latest");
        if (!response.ok) return;
        const payload = (await response.json()) as { message: MemberMessage | null };
        if (cancelled || !payload.message) return;

        const dismissedId = window.localStorage.getItem("nsf_latest_member_message_id");
        const alreadyDismissed = dismissedId === String(payload.message.id);
        setMemberMessage(payload.message);
        setMessageDismissed(alreadyDismissed);
        if (!alreadyDismissed) setMessageOpen(true);
      } catch {
        if (!cancelled) setMemberMessage(null);
      }
    };

    window.setTimeout(() => {
      void loadMemberMessage();
    }, 0);

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!messageOpen) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (notificationRef.current?.contains(event.target as Node)) return;
      dismissMessage();
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, [messageOpen, dismissMessage]);

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
            {t("About Us", "हमारे बारे में")}
          </Link>
          <Link href="/services" className="text-sm font-medium transition-colors hover:text-primary">
            {t("Programs", "कार्यक्रम")}
          </Link>
          <Link href="/campaigns" className="text-sm font-medium transition-colors hover:text-primary">
            {t("Campaigns", "अभियान")}
          </Link>
          <Link href="/news" className="text-sm font-medium transition-colors hover:text-primary">
            {t("News", "समाचार")}
          </Link>
          <Link href="/gallery" className="text-sm font-medium transition-colors hover:text-primary">
            {t("Activity Post", "गतिविधि पोस्ट")}
          </Link>
          <Link href="/contact" className="text-sm font-medium transition-colors hover:text-primary">
            {t("Contact", "संपर्क")}
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {memberMessage && (
            <div ref={notificationRef} className="relative">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setMessageOpen((open) => !open);
                }}
                className="relative flex h-9 w-9 items-center justify-center rounded-full border bg-background text-foreground hover:text-primary"
                aria-label={t("Notifications", "Notifications")}
              >
                <Bell className="h-4 w-4" />
                {!messageDismissed && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary" />}
              </button>

              {messageOpen && (
                <div className="absolute right-0 top-11 w-[min(22rem,calc(100vw-2rem))] rounded-xl border bg-card p-4 text-card-foreground shadow-xl">
                  <p className="text-xs font-semibold uppercase text-primary">{t("Member Notice", "Member Notice")}</p>
                  <h3 className="mt-1 font-serif text-lg font-bold">{memberMessage.title}</h3>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{memberMessage.message}</p>
                  <button type="button" onClick={dismissMessage} className="mt-3 text-xs font-semibold text-primary hover:underline">
                    {t("Close", "Close")}
                  </button>
                </div>
              )}
            </div>
          )}
          <button
            onClick={() => setLanguage(language === "en" ? "hi" : "en")}
            className="text-sm font-medium hover:text-primary"
          >
            {language === "hi" ? "English" : "Hindi"}
          </button>
          {user ? (
            <Link href="/dashboard" className="text-sm font-medium hover:text-primary">
              {t("Dashboard", "डैशबोर्ड")}
            </Link>
          ) : (
            <Link href="/login" className="text-sm font-medium hover:text-primary">
              {t("Login", "लॉगिन")}
            </Link>
          )}
          <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href="/donate">{t("Donate Now", "अभी दान करें")}</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}
