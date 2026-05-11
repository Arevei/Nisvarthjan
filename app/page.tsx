"use client";
import { Layout } from "@/components/layout/Layout";
import { useLanguage } from "@/lib/language-context";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useGetStats, useListNews, useListCampaigns } from "@/lib/api-client/api";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { ArrowRight, Calendar, Target, Eye, Compass, Sparkles, Heart, Leaf, Users2, BookOpen } from "lucide-react";

const CATEGORY_COLORS: Record<string, string> = {
  health:      "bg-rose-100 text-rose-700",
  education:   "bg-blue-100 text-blue-700",
  environment: "bg-green-100 text-green-700",
  women:       "bg-purple-100 text-purple-700",
  rural:       "bg-amber-100 text-amber-700",
  disaster:    "bg-orange-100 text-orange-700",
  general:     "bg-gray-100 text-gray-700",
};

const CATEGORY_IMAGES: Record<string, string> = {
  health:      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=800",
  education:   "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=800",
  environment: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=800",
  women:       "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800",
  rural:       "https://images.unsplash.com/photo-1590274853856-f22d5ee3d228?q=80&w=800",
  disaster:    "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?q=80&w=800",
  general:     "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800",
};

const IMPACT_AREAS = [
  {
    icon: BookOpen,
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=900",
    titleEn: "Education",      titleHi: "शिक्षा",
    descEn: "Quality education for underprivileged children and youth across rural India.",
    descHi: "ग्रामीण भारत में वंचित बच्चों को गुणवत्तापूर्ण शिक्षा।",
  },
  {
    icon: Heart,
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=900",
    titleEn: "Healthcare",     titleHi: "स्वास्थ्य सेवा",
    descEn: "Free medical camps and health awareness drives in underserved villages.",
    descHi: "वंचित गांवों में मुफ्त चिकित्सा शिविर और स्वास्थ्य जागरूकता।",
  },
  {
    icon: Users2,
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=900",
    titleEn: "Women Empowerment", titleHi: "महिला सशक्तिकरण",
    descEn: "Skill development and livelihood programs transforming women's lives.",
    descHi: "महिलाओं के जीवन को बदलने वाले कौशल विकास कार्यक्रम।",
  },
  {
    icon: Leaf,
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=900",
    titleEn: "Environment",    titleHi: "पर्यावरण",
    descEn: "Tree plantation and natural resource conservation for a greener India.",
    descHi: "हरित भारत के लिए वृक्षारोपण और प्राकृतिक संसाधन संरक्षण।",
  },
  {
    icon: Target,
    image: "https://images.unsplash.com/photo-1590274853856-f22d5ee3d228?q=80&w=900",
    titleEn: "Rural Development", titleHi: "ग्रामीण विकास",
    descEn: "Infrastructure, sanitation and connectivity for India's forgotten villages.",
    descHi: "भारत के भूले-बिसरे गांवों के लिए बुनियादी ढांचा और स्वच्छता।",
  },
  {
    icon: Users2,
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=900",
    titleEn: "Community Building", titleHi: "सामुदायिक निर्माण",
    descEn: "Uniting citizens for collective action, social justice and lasting change.",
    descHi: "सामूहिक कार्रवाई और सामाजिक परिवर्तन के लिए नागरिकों को एकजुट करना।",
  },
];

export default function Home() {
  const { t } = useLanguage();
  const { data: stats } = useGetStats();
  const { data: allNews = [] } = useListNews();
  const { data: allCampaigns = [] } = useListCampaigns();

  const latestNews = allNews.slice(0, 3);
  const featuredCampaigns = allCampaigns.filter((c) => c.isActive).slice(0, 3);

  return (
    <Layout>

      {/* ── HERO — split layout ── */}
      <section className="relative min-h-[92vh] flex flex-col lg:flex-row overflow-hidden">
        {/* Left — deep red panel */}
        <div className="relative z-10 flex flex-col justify-center bg-primary text-primary-foreground px-8 md:px-14 py-24 lg:py-0 lg:w-[52%] lg:min-h-screen">
          {/* Subtle texture overlay */}
          <div className="absolute inset-0 opacity-5 bg-[url('https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2070')] bg-cover bg-center" />
          <div className="relative z-10 max-w-xl">
            <span className="inline-block bg-white/15 text-white text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
              {t("Nisvarthjan Seva Foundation", "निस्वार्थजन सेवा फाउंडेशन")}
            </span>
            <h1 className="text-4xl md:text-5xl xl:text-6xl font-serif font-bold mb-6 leading-tight">
              {t("Empowering Communities,", "समुदायों को सशक्त बनाना,")}
              <span className="block text-white/80">{t("Transforming Lives", "जीवन बदलना")}</span>
            </h1>
            <p className="text-lg md:text-xl mb-10 text-primary-foreground/85 leading-relaxed font-serif">
              {t(
                "Join us in our mission to bring education, healthcare, and sustainable development to rural India.",
                "ग्रामीण भारत में शिक्षा, स्वास्थ्य सेवा और सतत विकास लाने के हमारे मिशन में शामिल हों।"
              )}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button size="lg" variant="secondary" asChild className="text-base px-8 py-6 font-semibold">
                <Link href="/donate">{t("Donate Now", "अभी दान करें")}</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-base px-8 py-6 bg-transparent text-primary-foreground border-white/50 hover:bg-white hover:text-primary font-semibold">
                <Link href="/membership">{t("Become a Member", "सदस्य बनें")}</Link>
              </Button>
            </div>
            {/* Quick trust stats */}
            {stats && (
              <div className="flex gap-8 border-t border-white/20 pt-8">
                {[
                  { n: `${(stats.livesImpacted / 1000).toFixed(0)}K+`, lbl: t("Lives", "जीवन") },
                  { n: stats.villagesCovered,                           lbl: t("Villages", "गांव") },
                  { n: stats.treesPlanted,                              lbl: t("Trees", "पेड़") },
                ].map(({ n, lbl }) => (
                  <div key={lbl}>
                    <div className="text-2xl font-bold font-serif">{n}</div>
                    <div className="text-xs text-white/60 uppercase tracking-wider mt-0.5">{lbl}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right — image collage */}
        <div className="relative lg:w-[48%] min-h-[50vh] lg:min-h-screen bg-gray-900 overflow-hidden">
          {/* Main backdrop image */}
          <img
            src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1400"
            alt="Community impact"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Dark gradient for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

          {/* Floating image cards */}
          <div className="absolute top-8 right-8 w-40 md:w-52 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20">
            <img
              src="https://images.unsplash.com/photo-1607748862156-7c548e7e98f4?q=80&w=600"
              alt="Children learning"
              className="w-full h-28 md:h-36 object-cover"
            />
          </div>
          <div className="absolute top-8 left-8 w-36 md:w-44 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20">
            <img
              src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=600"
              alt="Healthcare camp"
              className="w-full h-24 md:h-32 object-cover"
            />
          </div>
          <div className="absolute bottom-10 left-8 w-36 md:w-48 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20">
            <img
              src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=600"
              alt="Environment drive"
              className="w-full h-24 md:h-32 object-cover"
            />
          </div>

          {/* Bottom text overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <p className="text-white text-sm font-medium italic opacity-90">
              {t(
                '\u201cSelfless service is the highest form of humanity.\u201d \u2014 NSF',
                '\u201c\u0928\u093f\u0938\u094d\u0935\u093e\u0930\u094d\u0925 \u0938\u0947\u0935\u093e \u092e\u093e\u0928\u0935\u0924\u093e \u0915\u093e \u0938\u0930\u094d\u0935\u094b\u091a\u094d\u091a \u0938\u094d\u0935\u0930\u0942\u092a \u0939\u0948\u0964\u201d \u2014 NSF'
              )}
            </p>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      {stats && (
        <section className="relative py-0 overflow-hidden">
          {/* Background image with overlay */}
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=2000"
              alt=""
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-primary/90" />
          </div>
          <div className="relative z-10 container mx-auto px-4 py-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { value: stats.livesImpacted,       suffix: "+", label: t("Lives Impacted",    "प्रभावित जीवन") },
                { value: stats.villagesCovered,      suffix: "",  label: t("Villages Covered",  "कवर किए गए गांव") },
                { value: stats.totalMembers,         suffix: "",  label: t("Active Volunteers", "सक्रिय स्वयंसेवक") },
                { value: stats.treesPlanted,         suffix: "",  label: t("Trees Planted",     "लगाए गए पेड़") },
              ].map(({ value, suffix, label }) => (
                <div key={label} className="text-white">
                  <div className="text-4xl md:text-5xl font-bold font-serif mb-2">
                    <AnimatedCounter value={value} />{suffix}
                  </div>
                  <div className="text-sm font-medium text-white/70 uppercase tracking-wider">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── VISION & MISSION ── */}
      <section className="py-24 bg-background overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 text-primary text-sm font-semibold uppercase tracking-widest mb-3">
              <Sparkles className="w-4 h-4" />
              {t("निस्वार्थजन — Selfless People", "निस्वार्थजन — स्वार्थरहित लोग")}
            </span>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-foreground max-w-3xl mx-auto leading-tight">
              {t("Serving without Expectation, Building without Boundaries", "बिना अपेक्षा के सेवा, बिना सीमा के निर्माण")}
            </h2>
            <p className="mt-5 text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
              {t(
                "The name Nisvarthjan means 'selfless people' — those who give without keeping score. That spirit is the heart of everything we do.",
                "निस्वार्थजन का अर्थ है वे लोग जो बिना किसी स्वार्थ के देते हैं। यही भावना हमारे हर कार्य की नींव है।"
              )}
            </p>
          </div>

          {/* Vision — image left */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-24">
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1509099836639-18ba1795216d?q=80&w=1200"
                  alt="Vision — children learning"
                  className="w-full h-80 lg:h-[420px] object-cover"
                />
              </div>
              <div className="absolute -bottom-5 -right-5 bg-primary text-primary-foreground rounded-2xl px-6 py-4 shadow-xl hidden md:block">
                <div className="text-2xl font-bold font-serif">2014</div>
                <div className="text-xs opacity-80">{t("Est. — Serving India", "स्थापित — भारत सेवा")}</div>
              </div>
              {/* second accent photo */}
              <div className="absolute -top-5 -left-5 w-24 h-24 rounded-xl overflow-hidden border-4 border-white shadow-xl hidden md:block">
                <img src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=300" alt="" className="w-full h-full object-cover" />
              </div>
            </div>
            <div>
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-2 text-sm font-semibold mb-5">
                <Eye className="w-4 h-4" />
                {t("Our Vision", "हमारी दृष्टि")}
              </div>
              <h3 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-5 leading-snug">
                {t("An India where dignity is a birthright, not a privilege.", "एक ऐसा भारत जहाँ गरिमा जन्मसिद्ध अधिकार हो, विशेषाधिकार नहीं।")}
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-5">
                {t(
                  "We envision an India where no child goes without education, no family suffers for lack of healthcare, and every person — regardless of caste, gender, or geography — lives with opportunity and hope.",
                  "हम एक ऐसे भारत की कल्पना करते हैं जहाँ कोई बच्चा शिक्षा से वंचित न हो, कोई परिवार स्वास्थ्य के अभाव में न तड़पे।"
                )}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {t(
                  "By 2030, we aim to have directly impacted 50,000 lives across 500 villages of Uttar Pradesh, Madhya Pradesh, and the Vindhya region.",
                  "2030 तक, हमारा लक्ष्य उत्तर प्रदेश, मध्य प्रदेश और विंध्य क्षेत्र के 500 गांवों में 50,000 जीवनों को सीधे प्रभावित करना है।"
                )}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {[
                  t("Education for All", "सबके लिए शिक्षा"),
                  t("Healthcare Access", "स्वास्थ्य सेवा"),
                  t("Gender Equality",   "लैंगिक समानता"),
                  t("Rural Growth",      "ग्रामीण विकास"),
                ].map((tag) => (
                  <span key={tag} className="border border-primary/30 bg-primary/5 text-primary text-xs font-semibold px-3 py-1.5 rounded-full">{tag}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Mission — image right */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 bg-rose-50 text-primary rounded-full px-4 py-2 text-sm font-semibold mb-5">
                <Compass className="w-4 h-4" />
                {t("Our Mission", "हमारा मिशन")}
              </div>
              <h3 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-5 leading-snug">
                {t("Walk alongside the forgotten. Serve without keeping score.", "भुलाए गए लोगों के साथ कदम से कदम मिलाएं।")}
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-5">
                {t(
                  "Nisvarthjan Seva Foundation was built on a simple belief: true service asks for nothing in return. We walk alongside rural and marginalised communities — not as outsiders delivering aid, but as fellow citizens committed to lasting change.",
                  "निस्वार्थजन सेवा फाउंडेशन एक सरल विश्वास पर बना है: सच्ची सेवा कुछ नहीं माँगती। हम ग्रामीण और वंचित समुदायों के साथ कंधे से कंधा मिलाकर चलते हैं।"
                )}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {t(
                  "Through education camps, health drives, women's skill centres, and environmental programs, every volunteer carries forward the spirit of निस्वार्थ सेवा — selfless service.",
                  "शिक्षा शिविरों, स्वास्थ्य अभियानों और पर्यावरण कार्यक्रमों के माध्यम से, हर स्वयंसेवक निस्वार्थ सेवा की भावना को आगे बढ़ाता है।"
                )}
              </p>
              <div className="mt-8 grid grid-cols-2 gap-3">
                {[
                  { icon: Heart,    label: t("Compassion",   "करुणा")      },
                  { icon: Sparkles, label: t("Integrity",    "ईमानदारी")   },
                  { icon: Users2,   label: t("Inclusion",    "समावेश")     },
                  { icon: Leaf,     label: t("Sustainability","स्थिरता")   },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-3 bg-muted/50 rounded-xl px-4 py-3 border">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm font-semibold text-foreground">{label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="order-1 lg:order-2 relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?q=80&w=1200"
                  alt="Mission — volunteers serving"
                  className="w-full h-80 lg:h-[420px] object-cover"
                />
              </div>
              {/* second accent photo */}
              <div className="absolute -top-5 -right-5 w-24 h-24 rounded-xl overflow-hidden border-4 border-white shadow-xl hidden md:block">
                <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=300" alt="" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-5 -left-5 bg-card border shadow-xl rounded-2xl p-5 max-w-xs hidden md:block">
                <p className="text-sm text-muted-foreground italic leading-relaxed">
                  {t('\u201cSelfless service is the highest form of humanity.\u201d', '\u201cनिस्वार्थ सेवा मानवता का सर्वोच्च स्वरूप है।\u201d')}
                </p>
                <p className="text-xs text-primary font-semibold mt-2">— {t("NSF Core Value", "NSF मूल मूल्य")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── LATEST NEWS ── */}
      {latestNews.length > 0 && (
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-1">{t("Stay Informed", "जानकारी रखें")}</p>
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground">{t("Latest Updates", "ताज़ा समाचार")}</h2>
              </div>
              <Link href="/news" className="hidden sm:flex items-center gap-1 text-primary font-medium text-sm hover:underline">
                {t("All News", "सभी समाचार")} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {latestNews.map((article) => {
                const categoryImg = CATEGORY_IMAGES[article.category] ?? CATEGORY_IMAGES.general;
                return (
                  <Link key={article.id} href={`/news/${article.id}`}>
                    <article className="bg-card border rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group h-full flex flex-col">
                      {/* Image header */}
                      <div className="h-44 overflow-hidden relative">
                        <img
                          src={categoryImg}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        <span className={`absolute bottom-3 left-3 text-xs font-bold px-3 py-1 rounded-full capitalize ${CATEGORY_COLORS[article.category] ?? CATEGORY_COLORS.general}`}>
                          {article.category}
                        </span>
                      </div>
                      <div className="p-5 flex flex-col flex-1">
                        <span className="text-xs text-muted-foreground flex items-center gap-1 mb-3">
                          <Calendar className="w-3 h-3" />
                          {new Date(article.publishedAt).toLocaleDateString(t("en-IN", "hi-IN"), { day: "2-digit", month: "short", year: "numeric" })}
                          {article.author && <> · {article.author}</>}
                        </span>
                        <h3 className="font-bold text-foreground text-base mb-2 group-hover:text-primary transition-colors line-clamp-2 font-serif">
                          {t(article.title, article.titleHindi ?? article.title)}
                        </h3>
                        {article.excerpt && (
                          <p className="text-muted-foreground text-sm line-clamp-2 flex-1">{article.excerpt}</p>
                        )}
                        <div className="mt-4 flex items-center gap-1 text-primary text-sm font-semibold">
                          {t("Read more", "और पढ़ें")} <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
            <div className="text-center mt-8 sm:hidden">
              <Button variant="outline" asChild>
                <Link href="/news">{t("View All News", "सभी समाचार देखें")}</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* ── FEATURED CAMPAIGNS ── */}
      {featuredCampaigns.length > 0 && (
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-1">{t("Make a Difference", "फर्क डालें")}</p>
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground">{t("Active Campaigns", "सक्रिय अभियान")}</h2>
              </div>
              <Link href="/campaigns" className="hidden sm:flex items-center gap-1 text-primary font-medium text-sm hover:underline">
                {t("All Campaigns", "सभी अभियान")} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {featuredCampaigns.map((c) => {
                const pct = Math.min(100, Math.round((c.raisedAmount / c.goalAmount) * 100));
                const fallbackImg = CATEGORY_IMAGES[c.category] ?? CATEGORY_IMAGES.general;
                return (
                  <Link key={c.id} href={`/campaigns/${c.id}`}>
                    <div className="bg-card border rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group h-full flex flex-col">
                      <div className="h-48 overflow-hidden relative">
                        <img
                          src={c.imageUrl || fallbackImg}
                          alt={c.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <span className="absolute bottom-3 left-3 text-xs font-bold px-3 py-1 rounded-full capitalize bg-white/90 text-primary">
                          {c.category}
                        </span>
                      </div>
                      <div className="p-5 flex flex-col flex-1">
                        <h3 className="font-bold text-foreground mb-2 group-hover:text-primary transition-colors font-serif line-clamp-2">
                          {t(c.title, c.titleHindi ?? c.title)}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                          {t(c.description, c.descriptionHindi ?? c.description)}
                        </p>
                        <div>
                          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                            <span>{t("Raised", "एकत्रित")}: <strong className="text-foreground">₹{c.raisedAmount.toLocaleString("en-IN")}</strong></span>
                            <span className="font-bold text-primary">{pct}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                            <div className="bg-primary h-2 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
                            <span>{t("Goal", "लक्ष्य")}: ₹{c.goalAmount.toLocaleString("en-IN")}</span>
                            <span>{c.donorCount} {t("donors", "दानकर्ता")}</span>
                          </div>
                        </div>
                        <Button size="sm" className="mt-4 bg-primary hover:bg-primary/90 w-full">
                          {t("Donate to Campaign", "अभियान में दान करें")}
                        </Button>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
            <div className="text-center mt-8 sm:hidden">
              <Button variant="outline" asChild>
                <Link href="/campaigns">{t("View All Campaigns", "सभी अभियान देखें")}</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* ── IMPACT AREAS — image cards ── */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-1">{t("What We Do", "हम क्या करते हैं")}</p>
            <h2 className="text-3xl md:text-4xl font-serif font-bold">{t("Our Impact Areas", "हमारे प्रभाव क्षेत्र")}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {IMPACT_AREAS.map(({ icon: Icon, image, titleEn, titleHi, descEn, descHi }) => (
              <div key={titleEn} className="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all hover:-translate-y-1 cursor-default h-64">
                {/* Background image */}
                <img
                  src={image}
                  alt={titleEn}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-white font-bold text-lg font-serif">{t(titleEn, titleHi)}</h3>
                  </div>
                  <p className="text-white/80 text-sm leading-relaxed line-clamp-2">{t(descEn, descHi)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA — full-bleed image ── */}
      <section className="relative py-28 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2000"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-primary/88" />
        <div className="relative z-10 container mx-auto px-4 text-center text-primary-foreground">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
            {t("Ready to Make a Difference?", "क्या आप बदलाव लाने के लिए तैयार हैं?")}
          </h2>
          <p className="text-lg text-white/80 mb-10 max-w-xl mx-auto">
            {t("Every rupee donated and every hour volunteered brings us closer to a just India.", "हर दान और हर घंटे की सेवा हमें एक न्यायपूर्ण भारत के करीब ले जाती है।")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild className="text-lg px-10 py-6">
              <Link href="/donate">{t("Donate Now", "अभी दान करें")}</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-lg px-10 py-6 bg-transparent border-white/50 text-white hover:bg-white hover:text-primary">
              <Link href="/membership">{t("Join as Member", "सदस्य बनें")}</Link>
            </Button>
          </div>
        </div>
      </section>

    </Layout>
  );
}




