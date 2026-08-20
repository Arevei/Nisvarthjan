"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowDown, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { useLanguage } from "@/lib/language-context";

interface HeroStats {
  livesImpacted: number;
  villagesCovered: number;
  treesPlanted: number;
}

export function HomeHero({ stats }: { stats?: HeroStats | null }) {
  const { t } = useLanguage();
  return (
    <section className="relative isolate overflow-hidden bg-[#0B4A7F] text-white">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(115deg,#0B4A7F_0%,#1271BD_48%,#008DCB_100%)]" />
      <div className="absolute -right-32 -top-40 h-[34rem] w-[34rem] rounded-full border border-white/15" />
      <div className="absolute -right-16 -top-24 h-[24rem] w-[24rem] rounded-full border border-white/15" />
      <div className="absolute bottom-[-18rem] left-[-10rem] h-[30rem] w-[30rem] rounded-full border border-[#F4B734]/35" />
      <div className="container mx-auto grid min-h-[min(760px,calc(100vh-7rem))] items-center gap-12 px-5 py-16 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:py-24">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7 }}>
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[.2em] text-white/85 backdrop-blur">
            <Sparkles className="h-4 w-4 text-[#F4B734]" /> {t("Passion for the least", "सबसे वंचित के लिए जुनून")}
          </div>
          <h1 className="max-w-3xl font-serif text-5xl leading-[.98] tracking-[-.04em] text-balance sm:text-7xl lg:text-[6.5rem]">
            {t("Lifting the least. Empowering all.", "सबसे वंचित को उठाना। सबको सशक्त बनाना।")}
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-white/78 sm:text-xl">
            {t("PLEF partners with communities to turn everyday potential into lasting progress — through learning, livelihoods, health, and care for our shared planet.", "PLEF समुदायों के साथ मिलकर शिक्षा, आजीविका, स्वास्थ्य और प्रकृति के माध्यम से स्थायी प्रगति का निर्माण करता है।")}
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-13 rounded-full bg-[#F4B734] px-7 text-[#0B4A7F] shadow-xl shadow-[#0B4A7F]/25 hover:bg-[#ffd06a]">
              <Link href="/donate">{t("Start a ripple", "बदलाव की शुरुआत करें")} <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-13 rounded-full border-white/35 bg-white/10 px-7 text-white hover:bg-white hover:text-[#0B4A7F]">
              <Link href="/membership">{t("Join the movement", "अभियान से जुड़ें")}</Link>
            </Button>
          </div>
          <div className="mt-12 flex items-center gap-3 text-sm text-white/65"><span className="h-px w-10 bg-[#F4B734]" /> {t("Change begins with one shared decision.", "बदलाव एक साझा निर्णय से शुरू होता है।")}</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: .94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .9, delay: .15 }} className="relative mx-auto w-full max-w-xl">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/20 bg-white/10 p-3 shadow-2xl backdrop-blur-sm">
            <img src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1400" alt={t("Children learning together in a community classroom", "सामुदायिक कक्षा में साथ पढ़ते बच्चे")} className="aspect-[4/5] w-full rounded-[1.5rem] object-cover" />
            <div className="absolute bottom-8 left-8 right-8 rounded-2xl bg-[#0B4A7F]/90 p-5 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[.2em] text-[#F4B734]">{t("The PLEF promise", "PLEF का वादा")}</p>
              <p className="mt-2 font-serif text-2xl leading-tight">{t("Every person deserves a fair chance to flourish.", "हर व्यक्ति को आगे बढ़ने का समान अवसर मिलना चाहिए।")}</p>
            </div>
          </div>
          <div className="absolute -bottom-5 -right-4 hidden rounded-2xl bg-white p-4 text-[#0B4A7F] shadow-xl sm:block">
            <div className="font-serif text-3xl font-bold">{stats ? <AnimatedCounter value={stats.livesImpacted} duration={1800} /> : "1,000+"}</div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[#0B4A7F]/60">{t("lives touched", "जीवनों पर असर")}</div>
          </div>
        </motion.div>
      </div>
      <div className="container mx-auto flex items-center justify-center gap-2 pb-7 text-xs uppercase tracking-[.25em] text-white/50"><ArrowDown className="h-4 w-4" /> {t("Explore our impact", "हमारा प्रभाव देखें")}</div>
    </section>
  );
}

export default HomeHero;
