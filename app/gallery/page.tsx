"use client";
import { Layout } from "@/components/layout/Layout";
import { useLanguage } from "@/lib/language-context";
import { useListGallery } from "@/lib/api-client/api";

const GALLERY_ITEMS = [
  { id: -1, imageUrl: "/gallery/events/event-1.webp", caption: "Drinking Water Facility Inauguration", captionHindi: "शीतल पेय जल सेवा उद्घाटन", category: "events" },
  { id: -2, imageUrl: "/gallery/events/event-2.webp", caption: "Volunteer Team at Service Point", captionHindi: "सेवा केंद्र पर स्वयंसेवक टीम", category: "events" },
  { id: -3, imageUrl: "/gallery/events/event-3.webp", caption: "Counselling Support Session", captionHindi: "परामर्श सहयोग सत्र", category: "events" },
  { id: -4, imageUrl: "/gallery/events/event-4.webp", caption: "Women Welfare Interaction", captionHindi: "महिला कल्याण संवाद", category: "events" },
  { id: -5, imageUrl: "/gallery/events/event-5.webp", caption: "Community Participation", captionHindi: "सामुदायिक भागीदारी", category: "events" },
  { id: -6, imageUrl: "/gallery/events/event-6.webp", caption: "Office Service Desk", captionHindi: "कार्यालय सेवा डेस्क", category: "events" },
  { id: -7, imageUrl: "/gallery/events/event-7.webp", caption: "Leadership Presence", captionHindi: "नेतृत्व उपस्थिति", category: "events" },
];

export default function Gallery() {
  const { t } = useLanguage();
  const { data: uploadedItems = [], isLoading } = useListGallery();
  const galleryItems = uploadedItems.length > 0 ? uploadedItems : GALLERY_ITEMS;

  return (
    <Layout>
      <div className="bg-primary/5 py-12 md:py-20 border-b">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4">
            {t("Activity Posts", "Activity Posts")}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-serif">
            {t(
              "Glimpses of our impact and activities across various programs.",
              "हमारे कार्यक्रमों और प्रभाव की झलकियाँ।",
            )}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="h-72 animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryItems.map((item) => {
              const title = t(item.caption ?? "Activity post image", item.captionHindi ?? item.caption ?? "Activity post image");
              const detailsEn = "detailsEn" in item ? item.detailsEn : null;
              const detailsHi = "detailsHi" in item ? item.detailsHi : null;
              return (
                <article
                  key={item.id}
                  className="group relative h-72 overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.imageUrl} alt={title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="absolute inset-x-0 bottom-0 translate-y-2 p-5 text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    <span className="mb-2 inline-flex rounded-full bg-white/18 px-3 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
                      {item.category}
                    </span>
                    <h3 className="font-serif text-xl font-bold leading-snug">{title}</h3>
                    {(detailsEn || detailsHi) && (
                      <p className="mt-2 line-clamp-2 text-sm text-white/80">
                        {t(detailsEn ?? "", detailsHi ?? detailsEn ?? "")}
                      </p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
