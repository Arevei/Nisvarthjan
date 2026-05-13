"use client";
import { Layout } from "@/components/layout/Layout";
import { useLanguage } from "@/lib/language-context";
import { useListCampaigns } from "@/lib/api-client/api";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

const CATEGORY_LABELS: Record<string, { en: string; hi: string }> = {
  health: { en: "Health", hi: "स्वास्थ्य" },
  education: { en: "Education", hi: "शिक्षा" },
  environment: { en: "Environment", hi: "पर्यावरण" },
  women: { en: "Women", hi: "महिला सशक्तिकरण" },
  rural: { en: "Rural", hi: "ग्रामीण विकास" },
  disaster: { en: "Disaster", hi: "आपदा राहत" },
  general: { en: "General", hi: "सामान्य" },
};

const toPreviewText = (input: string) =>
  input
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export default function Campaigns() {
  const { t, language } = useLanguage();
  const { data: campaigns, isLoading } = useListCampaigns();

  return (
    <Layout>
      <div className="bg-primary/5 py-12 md:py-20 border-b">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4">
            {t("Crowdfunding Campaigns", "क्राउडफंडिंग अभियान")}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-serif">
            {t(
              "Support our active campaigns and help us reach our goals to make a difference.",
              "हमारे सक्रिय अभियानों का समर्थन करें और बदलाव लाने के हमारे लक्ष्यों को प्राप्त करने में मदद करें।"
            )}
          </p>
        </div>
      </div>
      <div className="container mx-auto px-4 py-16">
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col space-y-3">
                <Skeleton className="h-48 w-full rounded-xl" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-8 w-full mt-4" />
              </div>
            ))}
          </div>
        ) : campaigns && campaigns.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {campaigns.map((campaign) => {
              const progress = Math.min(100, Math.round((campaign.raisedAmount / campaign.goalAmount) * 100));
              const category = CATEGORY_LABELS[campaign.category] ?? CATEGORY_LABELS.general;
              return (
                <div key={campaign.id} className="bg-card rounded-2xl border overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col">
                  {campaign.imageUrl && (
                    <div className="aspect-video overflow-hidden">
                      <img 
                        src={campaign.imageUrl} 
                        alt={campaign.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full w-fit mb-4">
                      {t(category.en, category.hi)}
                    </div>
                    <h3 className="text-xl font-bold font-serif mb-2 line-clamp-2">
                      {language === "hi" && campaign.titleHindi ? campaign.titleHindi : campaign.title}
                    </h3>
                    <p className="text-muted-foreground line-clamp-2 mb-6 flex-1 text-sm">
                      {toPreviewText(language === "hi" && campaign.descriptionHindi ? campaign.descriptionHindi : campaign.description)}
                    </p>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2 font-medium">
                          <span>₹{campaign.raisedAmount.toLocaleString("en-IN")}</span>
                          <span className="text-muted-foreground">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground mt-2">
                          <span>{t("Raised", "एकत्रित")}</span>
                          <span>{t("Goal", "लक्ष्य")}: ₹{campaign.goalAmount.toLocaleString("en-IN")}</span>
                        </div>
                      </div>
                      <div className="text-sm text-center text-muted-foreground">
                        <span className="font-medium text-foreground">{campaign.donorCount}</span> {t("donors", "दानकर्ता")}
                      </div>
                      <Button asChild className="w-full bg-primary hover:bg-primary/90 text-white font-medium">
                        <Link href={`/campaigns/${campaign.id}`}>
                          {t("Support this cause", "इस अभियान का समर्थन करें")}
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-card rounded-2xl border border-dashed">
            <div className="text-6xl mb-4 text-muted-foreground/30">🎯</div>
            <h3 className="text-2xl font-serif font-bold mb-2">{t("No active campaigns", "अभी कोई सक्रिय अभियान नहीं")}</h3>
            <p className="text-muted-foreground">
              {t("Check back later for new fundraising initiatives.", "हमारी नई धन उगाहने वाली पहलों के लिए बाद में वापस आएं।")}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}




