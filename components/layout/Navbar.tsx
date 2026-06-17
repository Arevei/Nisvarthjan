"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Briefcase,
  ChevronDown,
  Globe,
  Heart,
  Images,
  Info,
  Languages,
  LayoutDashboard,
  LogIn,
  Megaphone,
  Menu,
  Newspaper,
  Phone,
} from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/lib/auth-context";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type MemberMessage = {
  id: number;
  title: string;
  message: string;
  createdAt: string;
};

export function Navbar() {
  const { language, setLanguage, t } = useLanguage();
  const { user } = useAuth();
  const pathname = usePathname();
  const [memberMessage, setMemberMessage] = useState<MemberMessage | null>(null);
  const [messageOpen, setMessageOpen] = useState(false);
  const [messageDismissed, setMessageDismissed] = useState(true);
  const notificationRef = useRef<HTMLDivElement | null>(null);

  const navItems = [
    { href: "/about", label: t("About Us", "हमारे बारे में"), icon: Info },
    { href: "/services", label: t("Programs", "कार्यक्रम"), icon: Briefcase },
    { href: "/campaigns", label: t("Campaigns", "अभियान"), icon: Megaphone },
    { href: "/news", label: t("News", "समाचार"), icon: Newspaper },
    { href: "/gallery", label: t("Activity Post", "गतिविधि पोस्ट"), icon: Images  },
    { href: "/contact", label: t("Contact", "संपर्क"), icon: Phone },
  ];

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
        if (cancelled) return;
        if (!payload.message) {
          setMemberMessage(null);
          setMessageOpen(false);
          setMessageDismissed(true);
          return;
        }

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
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex min-w-0 items-center">
          <Image
            src="/brand/navbar-logo.png"
            alt="Nisvarthjan Seva Foundation"
            width={270}
            height={70}
            priority
            className="h-12 w-auto sm:h-14"
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-6 lg:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm font-medium transition-colors hover:text-primary">
              {item.label}
            </Link>
          ))}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3">
          {/* Language Dropdown */}
          <div className="relative group">
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <Globe className="h-4 w-4" />
              <span>{language === "hi" ? "हिंदी" : "English"}</span>
              <ChevronDown className="h-3 w-3 opacity-60" />
            </button>
            <div className="absolute right-0 top-full mt-1 w-40 rounded-lg border bg-card shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={cn(
                  "flex w-full items-center gap-2 px-4 py-2.5 text-sm first:rounded-t-lg last:rounded-b-lg hover:bg-accent",
                  language === "en" && "bg-accent font-medium text-primary"
                )}
              >
                <span className="text-base">🇬🇧</span> English
              </button>
              <button
                type="button"
                onClick={() => setLanguage("hi")}
                className={cn(
                  "flex w-full items-center gap-2 px-4 py-2.5 text-sm first:rounded-t-lg last:rounded-b-lg hover:bg-accent",
                  language === "hi" && "bg-accent font-medium text-primary"
                )}
              >
                <span className="text-base">🇮🇳</span> हिंदी
              </button>
            </div>
          </div>

          {/* Notifications */}
          {memberMessage && (
            <div ref={notificationRef} className="relative">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setMessageOpen((open) => !open);
                }}
                className="relative flex h-9 w-9 items-center justify-center rounded-full border bg-background text-foreground hover:text-primary"
                aria-label={t("Notifications", "सूचनाएं")}
              >
                <Bell className="h-4 w-4" />
                {!messageDismissed && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary" />}
              </button>

              {messageOpen && (
                <div className="absolute right-0 top-11 w-[min(22rem,calc(100vw-2rem))] rounded-xl border bg-card p-4 text-card-foreground shadow-xl">
                  <p className="text-xs font-semibold uppercase text-primary">{t("Member Notice", "सदस्य सूचना")}</p>
                  <h3 className="mt-1 font-serif text-lg font-bold">{memberMessage.title}</h3>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{memberMessage.message}</p>
                  <button type="button" onClick={dismissMessage} className="mt-3 text-xs font-semibold text-primary hover:underline">
                    {t("Close", "बंद करें")}
                  </button>
                </div>
              )}
            </div>
          )}

          {user ? (
            <Link href="/dashboard" className="hidden text-sm font-medium hover:text-primary lg:inline-flex">
              {t("Dashboard", "डैशबोर्ड")}
            </Link>
          ) : (
            <Link href="/login" className="hidden text-sm font-medium hover:text-primary lg:inline-flex">
              {t("Login", "लॉगिन")}
            </Link>
          )}
          <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href="/donate">{t("Donate", "दान करें")}</Link>
          </Button>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden" aria-label={t("Open menu", "मेनू खोलें")}>
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex w-[88vw] max-w-sm flex-col overflow-y-auto p-0">
              <SheetHeader className="border-b bg-accent/60 px-5 pb-5 pt-6 text-left">
                <SheetClose asChild>
                  <Link href="/" className="mb-4 inline-flex">
                    <Image
                      src="/brand/navbar-logo.png"
                      alt="Nisvarthjan Seva Foundation"
                      width={220}
                      height={56}
                      className="h-10 w-auto"
                    />
                  </Link>
                </SheetClose>
                <SheetTitle className="pr-8 font-serif text-2xl text-primary">
                  {t("Nisvarthjan Seva", "निस्वार्थजन सेवा")}
                </SheetTitle>
                <SheetDescription>
                  {t("Explore pages, member area, and ways to support.", "पेज, सदस्य क्षेत्र और सहयोग के विकल्प देखें।")}
                </SheetDescription>
              </SheetHeader>

              <div className="flex flex-1 flex-col gap-5 px-5 py-5">
                <div className="grid gap-2">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);

                    return (
                      <SheetClose key={item.href} asChild>
                        <Link
                          href={item.href}
                          className={cn(
                            "flex min-h-12 items-center gap-3 rounded-lg border px-3 text-sm font-semibold transition-colors",
                            isActive
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-transparent bg-background hover:border-primary/20 hover:bg-accent hover:text-primary"
                          )}
                        >
                          <span
                            className={cn(
                              "flex h-9 w-9 shrink-0 items-center justify-center rounded-md",
                              isActive ? "bg-primary-foreground/15" : "bg-accent text-primary"
                            )}
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="truncate">{item.label}</span>
                        </Link>
                      </SheetClose>
                    );
                  })}
                </div>

                <Separator />

                <div className="grid gap-2">
                  <button
                    type="button"
                    onClick={() => setLanguage(language === "en" ? "hi" : "en")}
                    className="flex min-h-12 items-center gap-3 rounded-lg border border-transparent bg-background px-3 text-left text-sm font-semibold transition-colors hover:border-primary/20 hover:bg-accent hover:text-primary"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent text-primary">
                      <Languages className="h-4 w-4" />
                    </span>
                    {language === "hi" ? "English" : "Hindi"}
                  </button>

                  <SheetClose asChild>
                    <Link
                      href={user ? "/dashboard" : "/login"}
                      className="flex min-h-12 items-center gap-3 rounded-lg border border-transparent bg-background px-3 text-sm font-semibold transition-colors hover:border-primary/20 hover:bg-accent hover:text-primary"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent text-primary">
                        {user ? <LayoutDashboard className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
                      </span>
                      {user ? t("Dashboard", "डैशबोर्ड") : t("Login", "लॉगिन")}
                    </Link>
                  </SheetClose>
                </div>
              </div>

              <div className="border-t bg-card px-5 py-5">
                <SheetClose asChild>
                  <Link
                    href="/donate"
                    className={cn(
                      buttonVariants({ className: "min-h-12 w-full bg-primary text-primary-foreground hover:bg-primary/90" })
                    )}
                  >
                    <Heart className="h-4 w-4" />
                    {t("Donate Now", "अभी दान करें")}
                  </Link>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
