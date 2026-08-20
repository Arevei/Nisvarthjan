"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Heart, Leaf, Mail, PawPrint, Users, GraduationCap, HandHeart, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { HomeHero } from "@/components/home/HomeHero";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { useGetStats, useListCampaigns, useListGallery, useListNews } from "@/lib/api-client/api";
import { useLanguage } from "@/lib/language-context";

const programs = [
  { title: "Livelihoods & Enterprise", description: "Creating sustainable livelihoods through skills, tools, and market linkages.", image: "/images/women-development.jpg", icon: HandHeart },
  { title: "Education & Youth", description: "Empowering children and youth with access to quality education and life skills.", image: "/images/education.webp", icon: GraduationCap },
  { title: "Animal Welfare", description: "Promoting humane treatment, care, and coexistence with animals.", image: "/images/healthcare.jpg", icon: PawPrint },
  { title: "Environment & Community", description: "Building resilient communities through eco-friendly and climate-smart solutions.", image: "/images/environment.webp", icon: Leaf },
];

const partners = ["Heifer International", "CEE India", "Rotary", "GiveIndia", "CAF India", "GuideStar India"];
const fallbackImages = ["/images/education.webp", "/images/Community-Building.webp", "/images/environment.webp", "/images/women-development.jpg", "/images/healthcare.jpg"];

export default function Home() {
  const { data: stats } = useGetStats();
  const { data: campaigns = [] } = useListCampaigns();
  const { data: news = [] } = useListNews();
  const { data: gallery = [] } = useListGallery();
  const { t } = useLanguage();
  const featuredCampaign = campaigns.find((campaign) => campaign.isActive) ?? campaigns[0];
  const numbers = [
    { value: stats?.livesImpacted ?? 125000, label: "Lives Impacted", icon: Users, caption: "Across rural communities" },
    { value: stats?.villagesCovered ?? 850, label: "Livelihoods Created", icon: HandHeart, caption: "Through skill & enterprise" },
    { value: stats?.scholarshipsGiven ?? 10000, label: "Children Supported", icon: BookOpen, caption: "Access to quality education" },
    { value: 25000, label: "Animals Cared For", icon: PawPrint, caption: "Through welfare programs" },
  ];

  return <Layout>
    <HomeHero />

    <section className="bg-muted/70 py-10 sm:py-14">
      <div className="container mx-auto grid gap-8 px-5 lg:grid-cols-[1fr_3fr] lg:px-8">
        <div><h2 className="font-serif text-2xl font-bold text-primary sm:text-3xl">Our Mission in Action</h2><div className="my-4 h-1 w-9 bg-accent" /><p className="text-sm leading-6 text-muted-foreground">We work at the intersection of people, livelihoods, and compassion—driving sustainable change for a better tomorrow.</p></div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{numbers.map(({ value, label, icon: Icon, caption }) => <div key={label} className="rounded-2xl bg-card p-4 text-center shadow-sm sm:p-6"><Icon className="mx-auto size-7 text-primary" /><div className="mt-3 font-serif text-2xl font-bold text-primary sm:text-3xl"><AnimatedCounter value={value} duration={1600} format={(n) => n.toLocaleString("en-IN")} />+</div><p className="mt-1 text-xs font-semibold text-foreground">{label}</p><p className="mt-1 hidden text-xs text-muted-foreground sm:block">{caption}</p></div>)}</div>
      </div>
    </section>

    <section className="bg-background py-16 sm:py-20"><div className="container mx-auto px-5 lg:px-8"><div className="mb-10 text-center"><p className="text-sm font-bold uppercase tracking-[.2em] text-primary">Our work</p><h2 className="mt-2 font-serif text-3xl font-bold text-primary sm:text-4xl">Empowering Lives. Transforming Communities.</h2><div className="mx-auto mt-4 h-1 w-10 bg-accent" /></div><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{programs.map(({ title, description, image, icon: Icon }) => <article key={title} className="group overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-xl"><div className="relative h-44 overflow-hidden"><img src={image} alt={title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /><div className="absolute bottom-[-1.25rem] left-5 flex size-14 items-center justify-center rounded-full border-4 border-card bg-primary text-primary-foreground"><Icon className="size-6" /></div></div><div className="p-5 pt-8"><h3 className="font-bold text-primary">{title}</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p><Link href="/services" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">Learn More <ArrowRight className="size-4" /></Link></div></article>)}</div></div></section>

    {featuredCampaign && <section className="py-8 sm:py-12"><div className="container mx-auto px-5 lg:px-8"><div className="overflow-hidden rounded-3xl bg-primary text-primary-foreground shadow-xl"><div className="grid lg:grid-cols-[1.1fr_.9fr]"><div className="flex flex-col justify-center gap-5 p-7 sm:p-10"><p className="text-sm font-bold uppercase tracking-[.18em] text-accent">Featured campaign</p><h2 className="font-serif text-3xl font-bold sm:text-4xl">{featuredCampaign.title}</h2><p className="max-w-xl leading-7 text-primary-foreground/80">{featuredCampaign.description}</p><div className="flex flex-wrap items-center gap-3"><Button asChild variant="secondary" className="rounded-full"><Link href={`/campaigns/${featuredCampaign.id}`}>Support This Campaign <ArrowRight data-icon="inline-end" /></Link></Button><span className="text-sm text-primary-foreground/80">₹{featuredCampaign.raisedAmount.toLocaleString("en-IN")} raised of ₹{featuredCampaign.goalAmount.toLocaleString("en-IN")}</span></div></div><div className="relative min-h-64"><img src={featuredCampaign.imageUrl ?? "/images/healthcare.jpg"} alt={featuredCampaign.title} className="absolute inset-0 size-full object-cover" /><div className="absolute inset-0 bg-primary/20" /><div className="absolute right-6 top-6 flex size-14 items-center justify-center rounded-full border-2 border-primary-foreground bg-primary/70"><Play className="ml-1 size-6 fill-current" /></div></div></div></div></div></section>}

    <section className="bg-muted/40 py-14"><div className="container mx-auto px-5 lg:px-8"><div className="flex items-end justify-between"><div><p className="text-sm font-bold uppercase tracking-[.2em] text-primary">Latest news</p><h2 className="mt-2 font-serif text-3xl font-bold text-primary">Stay Informed</h2></div><Link href="/news" className="hidden items-center gap-1 text-sm font-semibold text-primary sm:flex">View all news <ArrowRight className="size-4" /></Link></div>{news.length > 0 ? <div className="mt-8 grid gap-5 md:grid-cols-3">{news.slice(0, 3).map((item) => <Link href={`/news/${item.id}`} key={item.id} className="group overflow-hidden rounded-2xl border bg-card shadow-sm"><img src={item.imageUrl ?? "/images/Community-Building.webp"} alt={item.title} className="h-44 w-full object-cover transition duration-500 group-hover:scale-105" /><div className="p-5"><p className="text-xs font-semibold text-muted-foreground">{new Date(item.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p><h3 className="mt-2 line-clamp-2 font-serif text-lg font-bold text-foreground group-hover:text-primary">{item.title}</h3><p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{item.excerpt ?? item.content}</p><span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">Read More <ArrowRight className="size-4" /></span></div></Link>)}</div> : <p className="mt-8 text-muted-foreground">New field updates are coming soon.</p>}</div></section>

    <section className="py-14"><div className="container mx-auto px-5 lg:px-8"><div className="text-center"><p className="text-sm font-bold uppercase tracking-[.2em] text-primary">Gallery</p><h2 className="mt-2 font-serif text-3xl font-bold text-primary">Moments That Matter</h2><div className="mx-auto my-4 h-1 w-10 bg-accent" /></div>{gallery.length > 0 ? <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">{gallery.slice(0, 5).map((item, index) => <Link href="/gallery" key={item.id} className="group relative aspect-[1.2] overflow-hidden rounded-xl"><img src={item.imageUrl ?? fallbackImages[index]} alt={item.caption ?? "PLEF community moment"} className="size-full object-cover transition duration-500 group-hover:scale-110" /><div className="absolute inset-0 bg-primary/0 transition group-hover:bg-primary/30" /></Link>)}</div> : <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">{fallbackImages.map((image) => <img key={image} src={image} alt="PLEF community moment" className="aspect-[1.2] rounded-xl object-cover" />)}</div>}<div className="mt-7 text-center"><Button asChild className="rounded-full"><Link href="/gallery">View Full Gallery <ArrowRight data-icon="inline-end" /></Link></Button></div></div></section>

    <section className="py-10"><div className="container mx-auto px-5 lg:px-8"><h2 className="text-center font-serif text-2xl font-bold text-primary sm:text-3xl">In Partnership for Greater Good</h2><div className="mx-auto my-4 h-1 w-10 bg-accent" /><div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-5 text-lg font-bold text-muted-foreground/75 sm:text-xl">{partners.map((partner) => <span key={partner}>{partner}</span>)}</div></div></section>

    <section className="bg-primary py-8 text-primary-foreground"><div className="container mx-auto flex flex-col gap-5 px-5 sm:flex-row sm:items-center sm:justify-between lg:px-8"><div><h2 className="font-serif text-2xl font-bold">Stay Connected. Be the Change.</h2><p className="mt-1 text-sm text-primary-foreground/75">Get updates on our impact, stories, and ways to get involved.</p></div><div className="flex w-full max-w-md gap-2"><div className="flex flex-1 items-center gap-2 rounded-full bg-card px-4 text-muted-foreground"><Mail className="size-4" /><span className="text-sm">Enter your email</span></div><Button variant="secondary" className="rounded-full">Subscribe <ArrowRight data-icon="inline-end" /></Button></div></div></section>
  </Layout>;
}

export { Home };
  
