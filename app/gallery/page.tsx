"use client";
import { Layout } from "@/components/layout/Layout";
import { useLanguage } from "@/lib/language-context";

export default function Gallery() {
  const { t } = useLanguage();

  return (
    <Layout>
      <div className="bg-primary/5 py-12 md:py-20 border-b">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4">
            {t("Photo Gallery", "फोटो गैलरी")}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-serif">
            {t(
              "Glimpses of our impact and activities across various programs.",
              "विभिन्न कार्यक्रमों में हमारे प्रभाव और गतिविधियों की झलक।"
            )}
          </p>
        </div>
      </div>
      <div className="container mx-auto px-4 py-16">
        <div className="text-center py-20 bg-card rounded-2xl border border-dashed">
          <div className="text-6xl mb-4 text-muted-foreground/30">📸</div>
          <h3 className="text-2xl font-serif font-bold mb-2">{t("Gallery coming soon", "गैलरी जल्द आ रही है")}</h3>
          <p className="text-muted-foreground">
            {t("We are curating photos of our recent work.", "हम अपने हालिया काम की तस्वीरें एकत्र कर रहे हैं।")}
          </p>
        </div>
      </div>
    </Layout>
  );
}



