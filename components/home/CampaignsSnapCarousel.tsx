"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/lib/language-context";
import type { Campaign } from "@/lib/api-client/api.schemas";

const CATEGORY_IMAGES: Record<string, string> = {
  health: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=1200",
  education: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1200",
  environment: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1200",
  women: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1200",
  rural: "https://images.unsplash.com/photo-1590274853856-f22d5ee3d228?q=80&w=1200",
  disaster: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?q=80&w=1200",
  general: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1200",
};

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

interface CampaignsSnapCarouselProps {
  campaigns: Campaign[];
}

export function CampaignsSnapCarousel({ campaigns }: CampaignsSnapCarouselProps) {
  const { t } = useLanguage();
  const trackRef = useRef<HTMLDivElement | null>(null);

  const scroll = (dir: "prev" | "next") => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({
      left: (dir === "next" ? 1 : -1) * el.clientWidth * 0.9,
      behavior: "smooth",
    });
  };

  return (
    <div>
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-3"
      >
        {campaigns.map((campaign) => {
          const progress = Math.min(
            100,
            Math.round((campaign.raisedAmount / Math.max(campaign.goalAmount, 1)) * 100),
          );
          const image = campaign.imageUrl || CATEGORY_IMAGES[campaign.category] || CATEGORY_IMAGES.general;
          const category = CATEGORY_LABELS[campaign.category] ?? CATEGORY_LABELS.general;

          return (
            <div
              key={campaign.id}
              className="shrink-0 basis-[88%] snap-center sm:basis-[68%] lg:basis-[42%] xl:basis-[34%]"
            >
              <Card className="group h-full overflow-hidden rounded-2xl border shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <CardContent className="relative flex min-h-[520px] flex-col justify-end p-0">
                  {/* Existing app image handling uses img because uploaded URLs are not constrained to configured Next image hosts. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image}
                    alt={campaign.title}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/42 to-black/8" />
                  <div className="absolute left-5 top-5">
                    <span className="rounded-full bg-white/92 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-primary">
                      {t(category.en, category.hi)}
                    </span>
                  </div>
                  <div className="absolute right-5 top-5 flex items-center gap-1.5 rounded-full border border-white/15 bg-black/35 px-3 py-1.5 text-xs font-medium text-white/90 backdrop-blur-sm">
                    <Users className="h-3.5 w-3.5" />
                    {campaign.donorCount} {t("donors", "दानकर्ता")}
                  </div>

                  <div className="relative p-6 md:p-7">
                    <div className="mb-5">
                      <div className="mb-2 flex justify-between text-xs text-white/72">
                        <span>
                          {t("Raised", "एकत्रित")}:{" "}
                          <strong className="text-white">
                            ₹{campaign.raisedAmount.toLocaleString("en-IN")}
                          </strong>
                        </span>
                        <span className="text-sm font-bold text-amber-300">{progress}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-primary"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="mt-1.5 text-xs text-white/58">
                        {t("Goal", "लक्ष्य")}: ₹{campaign.goalAmount.toLocaleString("en-IN")}
                      </div>
                    </div>

                    <h3 className="mb-3 line-clamp-2 font-serif text-2xl font-bold leading-snug text-white">
                      {t(campaign.title, campaign.titleHindi ?? campaign.title)}
                    </h3>
                    <p className="mb-6 line-clamp-2 text-sm leading-relaxed text-white/72">
                      {toPreviewText(
                        t(
                          campaign.description,
                          campaign.descriptionHindi ?? campaign.description,
                        ),
                      )}
                    </p>
                    <Button
                      asChild
                      className="w-full bg-[#B11226] py-5 font-semibold text-white hover:bg-[#8e0e1d]"
                    >
                      <Link href={`/campaigns/${campaign.id}`}>
                        {t("Donate to Campaign", "अभियान में दान करें")}
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {campaigns.length} {t("active campaigns", "सक्रिय अभियान")}
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll("prev")}
            className="rounded-full"
            aria-label={t("Previous campaign", "पिछला अभियान")}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll("next")}
            className="rounded-full"
            aria-label={t("Next campaign", "अगला अभियान")}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
