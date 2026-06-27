"use client";
import { useState } from "react";
import { X, ZoomIn } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
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

type GalleryItem = {
  id: number;
  imageUrl: string;
  imageUrls?: string[];
  caption?: string | null;
  captionHindi?: string | null;
  detailsEn?: string | null;
  detailsHi?: string | null;
  category: string;
};

const getActivityImages = (item: { imageUrl: string; imageUrls?: string[] | null }) =>
  Array.from(new Set([...(item.imageUrls ?? []), item.imageUrl].filter(Boolean))).slice(0, 4);

export default function Gallery() {
  const { t } = useLanguage();
  const { data: uploadedItems = [], isLoading } = useListGallery();
  const galleryItems = uploadedItems.length > 0 ? uploadedItems : GALLERY_ITEMS;
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  return (
    <Layout>
      <div className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold  mb-4">
            {t("Activity Posts", "गतिविधि पोस्ट")}
          </h1>
          <p className="text-xl max-w-2xl mx-auto font-serif">
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
              const itemImages = getActivityImages(item);
              return (
                <article
                  key={item.id}
                  className="group relative h-72 overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl cursor-pointer"
                  onClick={() => setSelectedItem({ ...item, imageUrls: itemImages })}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.imageUrl} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full scale-110 object-cover blur-xl" />
                  <div className="absolute inset-0 bg-black/25" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.imageUrl} alt={title} className="absolute inset-0 h-full w-full object-contain p-2 transition-transform duration-500 group-hover:scale-[1.03]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-100" />
                  {itemImages.length > 1 && (
                    <span className="absolute right-3 top-3 rounded-full bg-black/55 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                      1/{itemImages.length}
                    </span>
                  )}
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
                  {/* Zoom icon */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                      <ZoomIn className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Image Modal - Instagram style left/right layout */}
      {selectedItem && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={() => setSelectedItem(null)}
        >
          <button 
            className="absolute top-4 right-4 md:top-6 md:right-6 text-white hover:text-gray-300 transition-colors z-10"
            onClick={() => setSelectedItem(null)}
          >
            <X className="w-8 h-8" />
          </button>
          <div 
            className="relative max-w-5xl w-full max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image - Left side */}
            <div className="md:w-3/5 bg-black flex items-center justify-center">
              <Carousel className="w-full" opts={{ loop: getActivityImages(selectedItem).length > 1 }}>
                <CarouselContent className="ml-0">
                  {getActivityImages(selectedItem).map((imageUrl, index) => (
                    <CarouselItem key={`${imageUrl}-${index}`} className="pl-0">
                      <div className="relative flex h-[50vh] items-center justify-center md:h-[90vh]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imageUrl}
                          alt={t(selectedItem.caption ?? "Activity post image", selectedItem.captionHindi ?? selectedItem.caption ?? "Activity post image")}
                          className="max-h-full w-full object-contain"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {getActivityImages(selectedItem).length > 1 && (
                  <>
                    <CarouselPrevious className="left-3 border-white/30 bg-black/45 text-white hover:bg-black/70 hover:text-white" />
                    <CarouselNext className="right-3 border-white/30 bg-black/45 text-white hover:bg-black/70 hover:text-white" />
                  </>
                )}
              </Carousel>
            </div>
            {/* Content - Right side */}
            <div className="md:w-2/5 p-6 flex flex-col justify-center">
              <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary mb-3 w-fit">
                {selectedItem.category}
              </span>
              <h3 className="font-serif font-bold text-xl text-foreground mb-3">
                {t(selectedItem.caption ?? "Activity post image", selectedItem.captionHindi ?? selectedItem.caption ?? "Activity post image")}
              </h3>
              {("detailsEn" in selectedItem && selectedItem.detailsEn) || ("detailsHi" in selectedItem && selectedItem.detailsHi) ? (
                <p className="text-muted-foreground leading-relaxed">
                  {t(
                    ("detailsEn" in selectedItem ? selectedItem.detailsEn : "") ?? "",
                    ("detailsHi" in selectedItem ? selectedItem.detailsHi : selectedItem.detailsEn) ?? ""
                  )}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
