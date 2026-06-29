"use client";
import { useState } from "react";
import { ChevronDown, Info, X, ZoomIn } from "lucide-react";
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

function isVideoUrl(value: string) {
  return (
    /\.(mp4|webm|ogg|mov|m4v|m3u8)(\?|#|$)/i.test(value) ||
    /\/video\//i.test(value) ||
    /(^|[,/])f_(mp4|webm)([,/]|$)/i.test(value) ||
    /[?&](resource_type|type)=video/i.test(value)
  );
}

function GalleryMedia({
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

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img src={src} alt={alt} className={className} onError={() => setForceVideo(true)} />
  );
}

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

const toPreviewText = (value: string) =>
  value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export default function Gallery() {
  const { t } = useLanguage();
  const { data: uploadedItems = [], isLoading } = useListGallery();
  const galleryItems = uploadedItems.length > 0 ? uploadedItems : GALLERY_ITEMS;
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [isModalContentOpen, setIsModalContentOpen] = useState(true);

  const openItem = (item: GalleryItem, itemImages: string[]) => {
    setSelectedItem({ ...item, imageUrls: itemImages });
    setIsModalContentOpen(true);
  };

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
                  className="group overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl cursor-pointer"
                  onClick={() => openItem(item, itemImages)}
                >
                  <div className="relative flex h-60 items-center justify-center overflow-hidden bg-muted">
                    {!isVideoUrl(item.imageUrl) && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={item.imageUrl} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full scale-110 object-cover blur-xl opacity-40" />
                    )}
                    <GalleryMedia
                      src={item.imageUrl}
                      alt={title}
                      className="relative h-full w-full object-contain p-2 transition-transform duration-500 group-hover:scale-[1.03]"
                      videoClassName="h-full w-full bg-black object-contain"
                    />
                    {itemImages.length > 1 && (
                      <span className="absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                        1/{itemImages.length}
                      </span>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <div className="rounded-full bg-black/45 p-3 backdrop-blur-sm">
                        <ZoomIn className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    <span className="mb-2 inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                      {item.category}
                    </span>
                    <h3 className="font-serif text-xl font-bold leading-snug text-foreground">{title}</h3>
                    {(detailsEn || detailsHi) && (
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                        {toPreviewText(t(detailsEn ?? "", detailsHi ?? detailsEn ?? ""))}
                      </p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Full-page media modal - Desktop: 70% image + 30% content with toggle, Mobile: top/bottom */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-background lg:flex-row"
          onClick={() => setSelectedItem(null)}
        >
          {/* Close button - top right */}
          <button
            className="absolute right-4 top-4 z-30 rounded-full bg-black/60 p-2 text-white transition-colors hover:bg-black/80"
            onClick={() => setSelectedItem(null)}
            aria-label="Close"
          >
            <X className="h-7 w-7" />
          </button>

          {/* Image area - full width on mobile, 70% on desktop */}
          <div className="flex-shrink-0 bg-black lg:flex-[7] lg:h-full" onClick={(e) => e.stopPropagation()}>
            <Carousel className="w-full" opts={{ loop: getActivityImages(selectedItem).length > 1 }}>
              <CarouselContent className="ml-0">
                {getActivityImages(selectedItem).map((imageUrl, index) => (
                  <CarouselItem key={`${imageUrl}-${index}`} className="pl-0">
                    <div className="relative flex h-[50vh] items-center justify-center lg:h-screen">
                      <GalleryMedia
                        src={imageUrl}
                        alt={t(selectedItem.caption ?? "Activity post image", selectedItem.captionHindi ?? selectedItem.caption ?? "Activity post image")}
                        className="max-h-full w-full object-contain"
                        videoClassName="h-full w-full object-contain"
                        controls
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

          {/* Content panel - bottom on mobile, 30% on desktop with toggle */}
          <div className={`flex-1 overflow-y-auto border-t bg-card transition-all duration-300 lg:h-full lg:border-t-0 lg:border-l ${isModalContentOpen ? "lg:flex-[3]" : "lg:flex-[0.35]"}`} onClick={(e) => e.stopPropagation()}>
            {isModalContentOpen && <div className="p-4 sm:p-6">
              <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                {selectedItem.category}
              </span>
              {("detailsEn" in selectedItem && selectedItem.detailsEn) || ("detailsHi" in selectedItem && selectedItem.detailsHi) ? (
                <div
                  className="mt-3 space-y-3 leading-relaxed text-muted-foreground [&_a]:text-primary [&_a]:underline [&_h2]:font-serif [&_h2]:text-xl [&_h2]:font-bold [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-2 [&_ul]:list-disc [&_ul]:pl-5"
                  dangerouslySetInnerHTML={{
                    __html: toRenderableHtml(
                      t(
                        ("detailsEn" in selectedItem ? selectedItem.detailsEn : "") ?? "",
                        ("detailsHi" in selectedItem ? selectedItem.detailsHi : selectedItem.detailsEn) ?? ""
                      ),
                    ),
                  }}
                />
              ) : null}
            </div>}
            {/* Toggle button - bottom right on desktop */}
            <button
              type="button"
              onClick={() => setIsModalContentOpen((current) => !current)}
              className="hidden lg:absolute lg:bottom-4 lg:right-4 lg:inline-flex lg:items-center lg:gap-2 lg:rounded-full lg:bg-muted lg:px-3 lg:py-2 lg:text-sm lg:font-medium lg:text-foreground lg:shadow-sm lg:transition-colors lg:hover:bg-muted/80"
            >
              <Info className="h-4 w-4" />
              <span>{isModalContentOpen ? "Less" : "Details"}</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${isModalContentOpen ? "rotate-180" : ""}`} />
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}
