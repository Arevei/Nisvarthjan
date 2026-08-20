"use client";

import Link from "next/link";
import { ArrowRight, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language-context";

const heroImage = "https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=80&w=1600&auto=format&fit=crop";
const logo = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/469710739_612718211319474_5696599549072528849_n-MYot00380QWkD4ENrAK6cVVMH8XG4V.jpg";

export function HomeHero() {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden bg-background">
      <div className="absolute -left-20 top-0 h-64 w-64 rounded-full bg-secondary/10" />
      <div className="absolute bottom-0 left-0 right-0 h-32 opacity-50 [background-image:radial-gradient(ellipse_at_center,_transparent_35%,_hsl(var(--primary)/.12)_36%,_transparent_37%)] [background-size:28px_18px]" />
      <div className="container relative mx-auto grid min-h-[590px] items-center gap-10 px-5 py-14 lg:grid-cols-[.92fr_1.08fr] lg:px-8 lg:py-20">
        <div className="z-10 max-w-xl">
          <p className="mb-4 text-sm font-bold uppercase tracking-[.22em] text-primary">{t("Passion for the least", "सबसे वंचित के लिए जुनून")}</p>
          <h1 className="font-serif text-5xl font-bold leading-[1.02] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            {t("Building dignity. Empowering futures.", "गरिमा का निर्माण। भविष्य को सशक्त बनाना।")}
          </h1>
          <div className="my-7 h-1 w-12 bg-accent" />
          <p className="max-w-lg text-base leading-7 text-muted-foreground sm:text-lg">
            {t("We walk with communities to create lasting change through livelihood, education, care for animals, and a healthier planet.", "हम समुदायों के साथ मिलकर आजीविका, शिक्षा, पशु देखभाल और स्वस्थ ग्रह के माध्यम से स्थायी बदलाव लाते हैं।")}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-full px-7">
              <Link href="/about">{t("Our Mission", "हमारा मिशन")} <ArrowRight data-icon="inline-end" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full border-primary/30 px-7 text-primary hover:bg-primary hover:text-primary-foreground">
              <Link href="/donate"><Heart data-icon="inline-start" /> {t("Donate Now", "अभी दान करें")}</Link>
            </Button>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-2xl lg:mr-[-8rem]">
          <div className="relative overflow-hidden rounded-[50%_0_0_50%] border-[10px] border-primary/90 bg-primary p-2 shadow-2xl sm:border-[16px]">
            <img src={heroImage} alt={t("A smiling child holding a young goat", "एक मुस्कुराता बच्चा बकरी के बच्चे को पकड़े हुए") } className="aspect-[1.1] w-full rounded-[50%_0_0_50%] object-cover" />
          </div>
          <div className="absolute bottom-4 left-5 flex max-w-xs items-center gap-4 rounded-2xl bg-primary p-4 text-primary-foreground shadow-xl sm:bottom-8 sm:left-[-2rem] sm:p-5">
            <img src={logo} alt="PLEF" className="size-14 rounded-full object-cover ring-2 ring-primary-foreground/80" />
            <div><p className="font-bold">{t("A compassionate India", "एक संवेदनशील भारत")}</p><p className="mt-1 text-xs leading-5 text-primary-foreground/75">{t("Where every life is valued and every community thrives.", "जहाँ हर जीवन मूल्यवान है और हर समुदाय आगे बढ़ता है।")}</p></div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HomeHero;

