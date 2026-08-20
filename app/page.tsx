"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Heart, Leaf, PawPrint, Users, GraduationCap, Mail, HandHeart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { HomeHero } from "@/components/home/HomeHero";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { useGetStats, useListNews } from "@/lib/api-client/api";
import { useLanguage } from "@/lib/language-context";

const programs = [
  { title: "Livelihoods & Enterprise", description: "Creating sustainable livelihoods through skills, tools, and market linkages.", image: "/images/women-development.jpg", icon: HandHeart },
  { title: "Education & Youth", description: "Empowering children and youth with access to quality education and life skills.", image: "/images/education.webp", icon: GraduationCap },
  { title: "Animal Welfare", description: "Promoting humane treatment, care, and coexistence with animals.", image: "/images/healthcare.jpg", icon: PawPrint },
  { title: "Environment & Community", description: "Building resilient communities through eco-friendly and climate-smart solutions.", image: "/images/environment.webp", icon: Leaf },
];

const partners = ["Heifer International", "CEE India", "Rotary", "GiveIndia", "CAF India", "GuideStar India"];

export default function Home() {
  const { data: stats } = useGetStats();
  const { data: news = [] } = useListNews();
  const { t } = useLanguage();
  const numbers = [
    { value: stats?.livesImpacted ?? 125000, label: "Lives Impacted", icon: Users },
    { value: stats?.villagesCovered ?? 850, label: "Livelihoods Created", icon: HandHeart },
    { value: 10000, label: "Children Supported", icon: BookOpen },
    { value: 25000, label: "Animals Cared For", icon: PawPrint },
  ];

  return <Layout>
    <HomeHero />
    <section className="bg-muted/70 py-10 sm:py-14">
      <div className="container mx-auto grid gap-8 px-5 lg:grid-cols-[1fr_3fr] lg:px-8">
        <div><h2 className="font-serif text-2xl font-bold text-primary sm:text-3xl">{t("Our Mission in Action", "हमारा मिशन कार्य में")}</h2><div className="my-4 h-1 w-9 bg-accent" /><p className="text-sm leading-6 text-muted-foreground">{t("We work at the intersection of people, livelihoods, and compassion—driving sustainable change for a better tomorrow.", "हम लोगों, आजीविका और करुणा के संगम पर काम करते हैं।")}</p></div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{numbers.map(({ value, label, icon: Icon }) => <div key={label} className="rounded-2xl bg-card p-4 text-center shadow-sm sm:p-6"><Icon className="mx-auto size-7 text-primary" /><div className="mt-3 font-serif text-2xl font-bold text-primary sm:text-3xl"><AnimatedCounter value={value} duration={1600} format={(n) => n.toLocaleString("en-IN")} />+</div><p className="mt-1 text-xs font-semibold text-foreground">{t(label, label)}</p><p className="mt-1 hidden text-xs text-muted-foreground sm:block">Across rural communities</p></div>)}</div>
      </div>
    </section>

    <section className="bg-background py-16 sm:py-20"><div className="container mx-auto px-5 lg:px-8"><div className="mb-10 text-center"><p className="text-sm font-bold uppercase tracking-[.2em] text-primary">{t("Our work", "हमारा काम")}</p><h2 className="mt-2 font-serif text-3xl font-bold text-primary sm:text-4xl">{t("What We Do", "हम क्या करते हैं")}</h2><div className="mx-auto mt-4 h-1 w-10 bg-accent" /></div><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{programs.map(({ title, description, image, icon: Icon }) => <article key={title} className="group overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-xl"><div className="relative h-44 overflow-hidden"><img src={image} alt={title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /><div className="absolute bottom-[-1.25rem] left-5 flex size-14 items-center justify-center rounded-full border-4 border-card bg-primary text-primary-foreground"><Icon className="size-6" /></div></div><div className="p-5 pt-8"><h3 className="font-bold text-primary">{t(title, title)}</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">{t(description, description)}</p><Link href="/services" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">Learn More <ArrowRight className="size-4" /></Link></div></article>)}</div></div></section>

    <section className="bg-primary py-14 text-primary-foreground sm:py-18"><div className="container mx-auto grid items-center gap-10 px-5 lg:grid-cols-[.9fr_1.1fr] lg:px-8"><div><p className="text-sm font-bold uppercase tracking-[.2em] text-primary-foreground/70">{t("Real impact. Real stories.", "वास्तविक प्रभाव। वास्तविक कहानियाँ।")}</p><h2 className="mt-3 font-serif text-3xl font-bold sm:text-4xl">{t("Together, change becomes possible.", "साथ मिलकर बदलाव संभव है।")}</h2><div className="my-5 h-1 w-10 bg-accent" /><p className="max-w-md leading-7 text-primary-foreground/75">{t("Meet the people turning compassion into confidence, opportunity, and a future they can shape.", "उन लोगों से मिलिए जो करुणा को आत्मविश्वास और अवसर में बदल रहे हैं।")}</p><Button asChild variant="secondary" className="mt-7 rounded-full"><Link href="/news">Read our stories <ArrowRight data-icon="inline-end" /></Link></Button></div><div className="relative overflow-hidden rounded-3xl"><img src="/images/Community-Building.webp" alt="PLEF community members working together" className="h-72 w-full object-cover sm:h-80" /><div className="absolute bottom-4 right-4 max-w-xs rounded-2xl bg-card p-5 text-foreground shadow-xl"><Heart className="size-7 fill-accent text-accent" /><p className="mt-3 font-serif text-lg font-bold">“They gave me confidence and a future.”</p><p className="mt-2 text-xs text-muted-foreground">— A community entrepreneur, Rajasthan</p></div></div></div></section>

    <section className="py-14 sm:py-18"><div className="container mx-auto px-5 lg:px-8"><h2 className="text-center font-serif text-2xl font-bold text-primary sm:text-3xl">{t("In Partnership for Greater Good", "बेहतर समाज के लिए साझेदारी")}</h2><div className="mx-auto my-4 h-1 w-10 bg-accent" /><div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-5 text-lg font-bold text-muted-foreground/75 sm:text-xl">{partners.map((partner) => <span key={partner}>{partner}</span>)}</div></div></section>

    {news.length > 0 && <section className="bg-muted/50 py-14"><div className="container mx-auto px-5 lg:px-8"><div className="flex items-end justify-between"><div><p className="text-sm font-bold uppercase tracking-[.2em] text-primary">{t("Stories", "कहानियाँ")}</p><h2 className="mt-2 font-serif text-3xl font-bold text-primary">{t("From the field", "मैदान से")}</h2></div><Link href="/news" className="hidden items-center gap-1 text-sm font-semibold text-primary sm:flex">View all <ArrowRight className="size-4" /></Link></div><div className="mt-8 grid gap-5 md:grid-cols-3">{news.slice(0, 3).map((item) => <Link href={`/news/${item.id}`} key={item.id} className="group overflow-hidden rounded-2xl border bg-card"><img src={item.imageUrl ?? "/images/Community-Building.webp"} alt={item.title} className="h-48 w-full object-cover transition group-hover:scale-105" /><div className="p-5"><p className="text-xs font-semibold text-muted-foreground">{new Date(item.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p><h3 className="mt-2 line-clamp-2 font-serif text-lg font-bold text-foreground group-hover:text-primary">{item.title}</h3></div></Link>)}</div></div></section>}

    <section className="bg-secondary/10 py-14"><div className="container mx-auto flex flex-col items-start justify-between gap-8 px-5 sm:flex-row sm:items-center lg:px-8"><div><h2 className="font-serif text-3xl font-bold text-primary">{t("Be the change", "बदलाव बनें")}</h2><p className="mt-2 max-w-lg text-muted-foreground">{t("Your support helps create ripples of compassion and opportunity.", "आपका सहयोग करुणा और अवसर की लहरें पैदा करता है।")}</p></div><div className="flex flex-wrap gap-3"><Button asChild className="rounded-full"><Link href="/volunteer">Volunteer <Users data-icon="inline-end" /></Link></Button><Button asChild variant="outline" className="rounded-full border-primary text-primary"><Link href="/donate">Donate <Heart data-icon="inline-end" /></Link></Button><Button asChild variant="outline" className="rounded-full border-primary text-primary"><Link href="/contact">Partner <ArrowRight data-icon="inline-end" /></Link></Button></div></div></section>

    <section className="border-t bg-card py-10"><div className="container mx-auto flex flex-col gap-5 px-5 sm:flex-row sm:items-center sm:justify-between lg:px-8"><div><h2 className="font-serif text-2xl font-bold text-primary">Stay connected</h2><p className="mt-1 text-sm text-muted-foreground">Get updates on our impact, stories, and ways to get involved.</p></div><div className="flex w-full max-w-md gap-2"><div className="flex flex-1 items-center gap-2 rounded-full border px-4 text-muted-foreground"><Mail className="size-4" /><span className="text-sm">Enter your email</span></div><Button className="rounded-full">Subscribe <ArrowRight data-icon="inline-end" /></Button></div></div></section>
  </Layout>;
}
