"use client";
import { Layout } from "@/components/layout/Layout";
import { useLanguage } from "@/lib/language-context";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Link from "next/link";
import { useGetStats, useListNews, useListCampaigns, useListGallery } from "@/lib/api-client/api";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { CampaignsSnapCarousel } from "@/components/home/CampaignsSnapCarousel";
import { HomeHero } from "@/components/home/HomeHero";
import { ArrowRight, Calendar, Target, Eye, Compass, Sparkles, Heart, Leaf, Users2, BookOpen, X, ZoomIn, ChevronDown, Info } from "lucide-react";
import { useState } from "react";

const CATEGORY_COLORS: Record<string, string> = {
  health: "bg-rose-100 text-rose-700",
  education: "bg-blue-100 text-blue-700",
  environment: "bg-green-100 text-green-700",
  women: "bg-purple-100 text-purple-700",
  rural: "bg-amber-100 text-amber-700",
  disaster: "bg-orange-100 text-orange-700",
  general: "bg-gray-100 text-gray-700",
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

const CATEGORY_IMAGES: Record<string, string> = {
  health: "/images/healthcare.jpg",
  education: "/images/education.webp",
  environment: "/images/environment.webp",
  women: "/images/women-development.jpg",
  rural: "/images/Rural-Development.png",
  disaster: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?q=80&w=800",
  general: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800",
};

const IMPACT_AREAS = [
  {
    icon: BookOpen,
    image: "/images/education.webp",
    titleEn: "Education", titleHi: "शिक्षा",
    descEn: "Quality education for underprivileged children and youth across rural India.",
    descHi: "ग्रामीण भारत में वंचित बच्चों को गुणवत्तापूर्ण शिक्षा।",
  },
  {
    icon: Heart,
    image: "/images/healthcare.jpg",
    titleEn: "Healthcare", titleHi: "स्वास्थ्य सेवा",
    descEn: "Free medical camps and health awareness drives in underserved villages.",
    descHi: "वंचित गांवों में मुफ्त चिकित्सा शिविर और स्वास्थ्य जागरूकता।",
  },
  {
    icon: Users2,
    image: "/images/women-development.jpg",
    titleEn: "Women Empowerment", titleHi: "महिला सशक्तिकरण",
    descEn: "Skill development and livelihood programs transforming women's lives.",
    descHi: "महिलाओं के जीवन को बदलने वाले कौशल विकास कार्यक्रम।",
  },
  {
    icon: Leaf,
    image: "/images/environment.webp",
    titleEn: "Environment", titleHi: "पर्यावरण",
    descEn: "Tree plantation and natural resource conservation for a greener India.",
    descHi: "हरित भारत के लिए वृक्षारोपण और प्राकृतिक संसाधन संरक्षण।",
  },
  {
    icon: Target,
    image: "/images/Rural-Development.png",
    titleEn: "Rural Development", titleHi: "ग्रामीण विकास",
    descEn: "Infrastructure, sanitation and connectivity for India's forgotten villages.",
    descHi: "भारत के भूले-बिसरे गांवों के लिए बुनियादी ढांचा और स्वच्छता।",
  },
  {
    icon: Users2,
    image: "/images/Community-Building.webp",
    titleEn: "Community Building", titleHi: "सामुदायिक निर्माण",
    descEn: "Uniting citizens for collective action, social justice and lasting change.",
    descHi: "सामूहिक कार्रवाई और सामाजिक परिवर्तन के लिए नागरिकों को एकजुट करना।",
  },
];



const toPreviewText = (input: string) =>
  input
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");

const toRenderableHtml = (value: string) => {
  if (/<[a-z][\s\S]*>/i.test(value)) return value;

  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join("");
};

const getActivityImages = (item: { imageUrl: string; imageUrls?: string[] | null }) =>
  Array.from(new Set([...(item.imageUrls ?? []), item.imageUrl].filter(Boolean))).slice(0, 4);

function isVideoUrl(value: string) {
  return (
    /\.(mp4|webm|ogg|mov|m4v|m3u8)(\?|#|$)/i.test(value) ||
    /\/video\//i.test(value) ||
    /(^|[,/])f_(mp4|webm)([,/]|$)/i.test(value) ||
    /[?&](resource_type|type)=video/i.test(value)
  );
}

function ActivityMedia({
  src,
  alt,
  className,
  videoClassName,
  controls = false,
}: {
  src: string;
  alt: string;
  className: string;
  videoClassName?: string;
  controls?: boolean;
}) {
  const [forceVideo, setForceVideo] = useState(false);

  if (forceVideo || isVideoUrl(src)) {
    return (
      <video
        src={src}
        controls={controls}
        muted={!controls}
        playsInline
        preload="metadata"
        className={videoClassName ?? className}
      />
    );
  }

  return <img src={src} alt={alt} className={className} onError={() => setForceVideo(true)} />;
}

export default function Home() {
  const { t, language } = useLanguage();
  const { data: stats } = useGetStats();
  const { data: allNews = [] } = useListNews();
  const { data: allCampaigns = [] } = useListCampaigns();
  const { data: uploadedGallery = [] } = useListGallery();

  // Modal state for activity posts
  const [selectedImage, setSelectedImage] = useState<{ src: string; images: string[]; titleEn: string; titleHi: string; detailsEn: string; detailsHi: string } | null>(null);
  const [isActivityContentOpen, setIsActivityContentOpen] = useState(true);

  const latestNews = allNews.slice(0, 3);
  const featuredCampaigns = allCampaigns.filter((c) => c.isActive);
  const homeGalleryItems = uploadedGallery.length > 0
    ? uploadedGallery.slice(0, 6).map((item) => ({
      src: item.imageUrl,
      images: getActivityImages(item),
      titleEn: item.caption ?? "Activity post",
      titleHi: item.captionHindi ?? item.caption ?? "Activity post",
      detailsEn: item.detailsEn ?? item.category,
      detailsHi: item.detailsHi ?? item.detailsEn ?? item.category,
    }))
    : [];




  return (
    <Layout>

      <HomeHero stats={stats} />

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
                { value: stats.livesImpacted, suffix: "+", label: t("Lives Impacted", "प्रभावित जीवन") },
                { value: stats.villagesCovered, suffix: "", label: t("Villages Covered", "कवर किए गए गांव") },
                { value: stats.totalMembers, suffix: "", label: t("Active Volunteers", "सक्रिय स्वयंसेवक") },
                { value: stats.treesPlanted, suffix: "", label: t("Trees Planted", "लगाए गए पेड़") },
              ].map(({ value, suffix, label }) => (
                <div key={label} className="text-white">
                  <div className="text-4xl md:text-5xl font-bold font-serif mb-2">
                    <AnimatedCounter value={value} duration={2200} format={(n) => n.toLocaleString("en-IN")} />{suffix}
                  </div>
                  <div className="text-sm font-medium text-white/70 uppercase tracking-wider">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── VISION & MISSION ── */}
      <section className="py-24 bg-background overflow-hidden" id="mission">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 text-primary text-sm font-semibold uppercase tracking-widest mb-3">
              <Sparkles className="w-4 h-4" />
              {t("निस्वार्थजन: Selfless People", "निस्वार्थजन: स्वार्थरहित लोग")}
            </span>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-foreground max-w-3xl mx-auto leading-tight">
              {t("Serving without Expectation, Building without Boundaries", "बिना अपेक्षा के सेवा, बिना सीमा के निर्माण")}
            </h2>
            <p className="mt-5 text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
              {t(
                "The name Nisvarthjan means 'selfless people': those who give without keeping score. That spirit is the heart of everything we do.",
                "निस्वार्थजन का अर्थ है वे लोग जो बिना किसी स्वार्थ के देते हैं। यही भावना हमारे हर कार्य की नींव है।"
              )}
            </p>
          </div>

          {/* Vision: image left */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-24">
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="/images/Vision.png"
                  alt="Vision: children learning"
                  className="w-full h-80 lg:h-[420px] object-cover"
                />
              </div>
              <div className="absolute -bottom-5 -right-5 bg-primary text-primary-foreground rounded-2xl px-6 py-4 shadow-xl hidden md:block">
                <div className="text-2xl font-bold font-serif">2025</div>
                <div className="text-xs opacity-80">{t("Est. 2025: Serving India", "स्थापित 2025: भारत सेवा")}</div>
              </div>

            </div>
            <div >
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-2 text-sm font-semibold mb-5">
                <Eye className="w-4 h-4" />
                {t("Our Vision", "हमारी दृष्टि")}
              </div>
              <h3 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-5 leading-snug">
                {t("An India where dignity is a birthright, not a privilege.", "एक ऐसा भारत जहाँ गरिमा जन्मसिद्ध अधिकार हो, विशेषाधिकार नहीं।")}
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-5">
                {t(
                  "We envision an India where no child goes without education, no family suffers for lack of healthcare, and every person, regardless of caste, gender, or geography, lives with opportunity and hope.",
                  "हम एक ऐसे भारत की कल्पना करते हैं जहाँ कोई बच्चा शिक्षा से वंचित न हो, कोई परिवार स्वास्थ्य के अभाव में न तड़पे।"
                )}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {t(
                  "Our ultimate goal is to empower underserved rural communities, bringing sustainable growth, health, and education right to their doorsteps.",
                  "हमारा अंतिम लक्ष्य वंचित ग्रामीण समुदायों को सशक्त बनाना है, जिससे उनके जीवन में स्थायी विकास, स्वास्थ्य और शिक्षा का उजाला फैल सके।"
                )}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {[
                  t("Education for All", "सबके लिए शिक्षा"),
                  t("Healthcare Access", "स्वास्थ्य सेवा"),
                  t("Gender Equality", "लैंगिक समानता"),
                  t("Rural Growth", "ग्रामीण विकास"),
                ].map((tag) => (
                  <span key={tag} className="border border-primary/30 bg-primary/5 text-primary text-xs font-semibold px-3 py-1.5 rounded-full">{tag}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Mission: image right */}
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
                  "Nisvarthjan Seva Foundation was built on a simple belief: true service asks for nothing in return. We walk alongside rural and marginalised communities, not as outsiders delivering aid, but as fellow citizens committed to lasting change.",
                  "निस्वार्थजन सेवा फाउंडेशन एक सरल विश्वास पर बना है: सच्ची सेवा कुछ नहीं माँगती। हम ग्रामीण और वंचित समुदायों के साथ कंधे से कंधा मिलाकर चलते हैं।"
                )}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {t(
                  "Through education camps, health drives, women's skill centres, and environmental programs, every volunteer carries forward the spirit of निस्वार्थ सेवा, selfless service.",
                  "शिक्षा शिविरों, स्वास्थ्य अभियानों और पर्यावरण कार्यक्रमों के माध्यम से, हर स्वयंसेवक निस्वार्थ सेवा की भावना को आगे बढ़ाता है।"
                )}
              </p>
              <div className="mt-8 grid grid-cols-2 gap-3">
                {[
                  { icon: Heart, label: t("Compassion", "करुणा") },
                  { icon: Sparkles, label: t("Integrity", "ईमानदारी") },
                  { icon: Users2, label: t("Inclusion", "समावेश") },
                  { icon: Leaf, label: t("Sustainability", "स्थिरता") },
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
                  src="/images/mission.png"
                  alt="Mission: volunteers serving"
                  className="w-full h-80 lg:h-[420px] object-cover"
                />
              </div>

              <div className="absolute -bottom-5 -left-5 bg-card border shadow-xl rounded-2xl p-5 max-w-xs hidden md:block">
                <p className="text-sm text-muted-foreground italic leading-relaxed">
                  {t('\u201cSelfless service is the highest form of humanity.\u201d', '\u201cनिस्वार्थ सेवा मानवता का सर्वोच्च स्वरूप है।\u201d')}
                </p>
                <p className="text-xs text-primary font-semibold mt-2">{t("NSF Core Value", "NSF मूल मूल्य")}</p>
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
                const categoryImg = article.imageUrl ?? CATEGORY_IMAGES.general;
                const category = CATEGORY_LABELS[article.category] ?? CATEGORY_LABELS.general;
                const preview =
                  language === "hi"
                    ? toPreviewText(article.contentHindi ?? article.content)
                    : toPreviewText(article.excerpt ?? article.content);
                return (
                  <Link key={article.id} href={`/news/${article.id}`}>
                    <article className="bg-card border rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group h-full flex flex-col">
                      {/* Image header */}
                      <div className="h-56 overflow-hidden relative bg-black">
                        <img
                          src={categoryImg}
                          alt=""
                          aria-hidden="true"
                          className="absolute inset-0 h-full w-full scale-110 object-cover blur-xl"
                        />
                        <div className="absolute inset-0 bg-black/20" />
                        <img
                          src={categoryImg}
                          alt={article.title}
                          className="absolute inset-0 h-full w-full object-contain p-2 transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        <span className={`absolute bottom-3 left-3 text-xs font-bold px-3 py-1 rounded-full capitalize ${CATEGORY_COLORS[article.category] ?? CATEGORY_COLORS.general}`}>
                          {t(category.en, category.hi)}
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
                        <p className="text-muted-foreground text-sm line-clamp-2 flex-1">{preview}</p>
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

            <CampaignsSnapCarousel campaigns={featuredCampaigns} />
            <div className="text-center mt-8 sm:hidden">
              <Button variant="outline" asChild>
                <Link href="/campaigns">{t("View All Campaigns", "सभी अभियान देखें")}</Link>
              </Button>
            </div>
          </div>
        </section>
      )}




      {/* Impact areas image cards */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-1">{t("What We Do", "हम क्या करते हैं")}</p>
            <h2 className="text-3xl md:text-4xl font-serif font-bold">{t("Our Impact Areas", "हमारे प्रभाव क्षेत्र")}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {IMPACT_AREAS.map(({ icon: Icon, image, titleEn, titleHi, descEn, descHi }) => (
              <div key={titleEn} className="group rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all hover:-translate-y-1 cursor-default bg-white">
                {/* Image */}
                <div className="flex items-center justify-center pt-3 gap-2 mx-auto  mb-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="text-primary font-bold text-lg font-serif">{t(titleEn, titleHi)}</h3>
                </div>
                <div className="h-56 overflow-hidden">
                  <img
                    src={image}
                    alt={titleEn}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                {/* Content below image */}
                <div className="p-3">

                  <p className="text-muted-foreground text-sm leading-relaxed">{t(descEn, descHi)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* Activity posts section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-1">
                {t("Ground Activities", "मैदानी गतिविधियाँ")}
              </p>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
                {t("Recent Activity Posts", "हाल की गतिविधि पोस्ट")}
              </h2>
              <p className="text-muted-foreground mt-2 max-w-2xl">
                {t(
                  "Snapshots from our drinking water initiative, counselling sessions, and community meetings in Tihar and Rampura.",
                  "तिहार और रामपुरा में पेयजल पहल, परामर्श सत्र और सामुदायिक बैठकों की झलकियाँ।",
                )}
              </p>
            </div>
            <Link href="/gallery" className="hidden sm:flex items-center gap-1 text-primary font-medium text-sm hover:underline">
              {t("View Activity Posts", "गतिविधि पोस्ट देखें")} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {homeGalleryItems.map((item, index) => (
              <article
                key={`${item.src}-${index}`}
                className="group overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl cursor-pointer"
                onClick={() => {
                  setSelectedImage(item);
                  setIsActivityContentOpen(true);
                }}
              >
                {/* Image on top */}
                <div className="relative h-56 overflow-hidden bg-black">
                  {!isVideoUrl(item.src) && (
                    <>
                      <img src={item.src} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full scale-110 object-cover blur-xl" />
                      <div className="absolute inset-0 bg-black/25" />
                    </>
                  )}
                  <ActivityMedia
                    src={item.src}
                    alt={item.titleEn}
                    className="absolute inset-0 h-full w-full object-contain p-2 transition-transform duration-500 group-hover:scale-[1.03]"
                    videoClassName="h-full w-full bg-black object-contain"
                  />
                  {item.images.length > 1 && (
                    <span className="absolute right-3 top-3 rounded-full bg-black/55 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                      1/{item.images.length}
                    </span>
                  )}
                  {/* Zoom icon on hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                      <ZoomIn className="w-7 h-7 text-white" />
                    </div>
                  </div>
                </div>
                {/* Content below image */}
                <div className="p-5">
                  <h3 className="font-serif font-bold text-lg text-foreground mb-2 line-clamp-2">
                    {t(item.titleEn, item.titleHi)}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                    {toPreviewText(t(item.detailsEn, item.detailsHi))}
                  </p>
                </div>
              </article>
            ))}
          </div>

          {/* Image Modal - Responsive layout */}
          {selectedImage && (
            <div
              className="fixed inset-0 z-50 flex bg-background"
              onClick={() => setSelectedImage(null)}
            >
              <button
                className="absolute right-4 top-4 z-20 rounded-full bg-black/60 p-2 text-white transition-colors hover:bg-black/80"
                onClick={() => setSelectedImage(null)}
                aria-label="Close"
              >
                <X className="h-7 w-7" />
              </button>
              <div
                className="relative flex h-full w-full flex-col overflow-hidden lg:flex-row"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Image area - left on desktop, top on mobile */}
                <div className="min-h-0 flex-1 bg-black lg:h-full">
                  <Carousel className="w-full" opts={{ loop: selectedImage.images.length > 1 }}>
                    <CarouselContent className="ml-0">
                      {selectedImage.images.map((imageUrl, index) => (
                        <CarouselItem key={`${imageUrl}-${index}`} className="pl-0">
                          <div className="relative flex h-[calc(100vh-92px)] items-center justify-center lg:h-screen">
                            <ActivityMedia
                              src={imageUrl}
                              alt={selectedImage.titleEn}
                              className="max-h-full w-full object-contain"
                              videoClassName="h-full w-full object-contain"
                              controls
                            />
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    {selectedImage.images.length > 1 && (
                      <>
                        <CarouselPrevious className="left-3 border-white/30 bg-black/45 text-white hover:bg-black/70 hover:text-white" />
                        <CarouselNext className="right-3 border-white/30 bg-black/45 text-white hover:bg-black/70 hover:text-white" />
                      </>
                    )}
                  </Carousel>
                </div>

                {/* Content panel - right on desktop, bottom on mobile */}
                <div className={`border-t bg-card transition-all duration-300 lg:h-full lg:border-l lg:border-t-0 ${isActivityContentOpen ? "lg:w-[420px]" : "lg:w-16"}`}>
                  {/* Toggle bar at the dividing edge */}
                  <button
                    type="button"
                    onClick={() => setIsActivityContentOpen((current) => !current)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left sm:px-6 lg:min-h-16 lg:px-4"
                  >
                    <span className="inline-flex min-w-0 items-center gap-2 text-sm font-semibold text-foreground">
                      <Info className="h-4 w-4 text-primary" />
                      <span className={`${isActivityContentOpen ? "line-clamp-2" : "sr-only"}`}>
                        {t(selectedImage.titleEn, selectedImage.titleHi)}
                      </span>
                    </span>
                    <ChevronDown className={`h-5 w-5 shrink-0 transition-transform ${isActivityContentOpen ? "rotate-180" : ""}`} />
                  </button>
                  {isActivityContentOpen && (
                    <div className="max-h-44 overflow-y-auto px-4 pb-5 sm:px-6 lg:max-h-[calc(100vh-64px)]">
                      {(selectedImage.detailsEn || selectedImage.detailsHi) && (
                        <div
                          className="space-y-3 leading-relaxed text-muted-foreground [&_a]:text-primary [&_a]:underline [&_h2]:font-serif [&_h2]:text-xl [&_h2]:font-bold [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-2 [&_ul]:list-disc [&_ul]:pl-5"
                          dangerouslySetInnerHTML={{
                            __html: toRenderableHtml(t(selectedImage.detailsEn, selectedImage.detailsHi)),
                          }}
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="text-center mt-8 sm:hidden">
            <Button variant="outline" asChild>
              <Link href="/gallery">{t("View Activity Posts", "गतिविधि पोस्ट देखें")}</Link>
            </Button>
          </div>
        </div>
      </section>


      <section className="max-w-5xl mx-auto mt-16 px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
            {t("Leadership Team", "नेतृत्व टीम")}
          </h2>
          <p className="text-muted-foreground mt-2">
            {t(
              "Founder, Secretary and Treasurer",
              "संस्थापक, सचिव और कोषाध्यक्ष"
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 place-items-center mb-10">
          {[
            {
              name: "Mayank Singh",
              hname: "मयंक सिंह",
              roleEn: "Founder",
              roleHi: "संस्थापक",
              image: "/leadership/Founder.jpg",
            },

            {
              name: "Punit Tiwari",
              hname: "पुनीत तिवारी",
              roleEn: "Treasurer",
              roleHi: "कोषाध्यक्ष",
              image: "/leadership/Treasurer.jpg",
            },
            {
              name: "Himani Tiwari",
              hname: "हिमानी तिवारी",
              roleEn: "Secretary, Social Affairs",
              roleHi: "सचिव, सामाजिक मामले",
              image: "/leadership/Secretary.jpg",
            },
            {
              name: "Hemant Pratap Singh",
              hname: "हेमंत प्रताप सिंह",
              roleEn: "Vice President",
              roleHi: "उपाध्यक्ष",
              image: "/leadership/vice-president.jpeg",
            },
          ].map((member) => (
            <div
              key={member.roleEn}
              className="w-full max-w-sm bg-card border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
            >
              <img
                src={member.image}
                alt={member.roleEn}
                className="w-full h-96 aspect-[3/4] object-cover"
              />

              <div className="p-5 text-center">
                <h3 className="text-lg font-semibold text-foreground">
                  {t(member.name, member.hname)}
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  {t(member.roleEn, member.roleHi)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

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




