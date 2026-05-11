"use client";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t bg-card mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-serif text-lg font-bold text-primary mb-4">
              {t("Nisvarthjan Seva Foundation", "निस्वार्थजन सेवा फाउंडेशन")}
            </h3>
            <p className="text-sm text-muted-foreground mb-4 font-serif italic">
              "मानव सेवा ही सर्वोच्च सेवा है"
            </p>
            <p className="text-sm text-muted-foreground">
              {t(
                "Dedicated to education, health, women empowerment, and rural development across India.",
                "भारत भर में शिक्षा, स्वास्थ्य, महिला सशक्तिकरण और ग्रामीण विकास के लिए समर्पित।"
              )}
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4">{t("Quick Links", "महत्वपूर्ण लिंक")}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-primary">{t("About Us", "हमारे बारे में")}</Link></li>
              <li><Link href="/mission" className="hover:text-primary">{t("Mission & Vision", "मिशन और विजन")}</Link></li>
              <li><Link href="/services" className="hover:text-primary">{t("Our Programs", "हमारे कार्यक्रम")}</Link></li>
              <li><Link href="/membership" className="hover:text-primary">{t("Join Us", "हमसे जुड़ें")}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">{t("Legal", "कानूनी")}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/privacy" className="hover:text-primary">{t("Privacy Policy", "गोपनीयता नीति")}</Link></li>
              <li><Link href="/terms" className="hover:text-primary">{t("Terms & Conditions", "नियम एवं शर्तें")}</Link></li>
              <li><Link href="/verify" className="hover:text-primary">{t("Verify Certificate", "प्रमाणपत्र सत्यापित करें")}</Link></li>
              <li><Link href="/admin/login" className="hover:text-primary">{t("Admin Login", "व्यवस्थापक लॉगिन")}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">{t("Connect", "संपर्क करें")}</h4>
            <div className="flex gap-4">
              <a href="#" className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-colors">FB</a>
              <a href="#" className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-colors">IG</a>
              <a href="#" className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-colors">TW</a>
              <a href="#" className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-colors">YT</a>
            </div>
          </div>
        </div>
        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Nisvarthjan Seva Foundation. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}




