"use client";
import { Layout } from "@/components/layout/Layout";
import { useLanguage } from "@/lib/language-context";

const GALLERY_ITEMS = [
  { src: "/gallery/events/event-1.webp", titleEn: "Drinking Water Facility Inauguration", titleHi: "???? ??? ?? ???? ???????" },
  { src: "/gallery/events/event-2.webp", titleEn: "Volunteer Team at Service Point", titleHi: "???? ?????? ?? ????????? ???" },
  { src: "/gallery/events/event-3.webp", titleEn: "Counselling Support Session", titleHi: "??????? ????? ????" },
  { src: "/gallery/events/event-4.webp", titleEn: "Women Welfare Interaction", titleHi: "????? ?????? ?????" },
  { src: "/gallery/events/event-5.webp", titleEn: "Community Participation", titleHi: "????????? ????????" },
  { src: "/gallery/events/event-6.webp", titleEn: "Office Service Desk", titleHi: "???????? ???? ?????" },
  { src: "/gallery/events/event-7.webp", titleEn: "Leadership Presence", titleHi: "??????? ????????" },
];

export default function Gallery() {
  const { t } = useLanguage();

  return (
    <Layout>
      <div className="bg-primary/5 py-12 md:py-20 border-b">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4">
            {t("Photo Gallery", "???? ?????")}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-serif">
            {t(
              "Glimpses of our impact and activities across various programs.",
              "??????? ??????????? ??? ????? ?????? ?? ?????????? ?? ????",
            )}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {GALLERY_ITEMS.map((item) => (
            <article key={item.src} className="bg-card border rounded-2xl overflow-hidden hover:shadow-xl transition-all">
              <img src={item.src} alt={item.titleEn} className="w-full h-64 object-cover" />
              <div className="p-4">
                <h3 className="font-serif font-bold text-foreground">{t(item.titleEn, item.titleHi)}</h3>
              </div>
            </article>
          ))}
        </div>
      </div>
    </Layout>
  );
}
