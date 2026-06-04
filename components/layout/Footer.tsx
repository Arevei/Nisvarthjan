"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";
import { MapPin, Phone, Mail } from "lucide-react";
export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="mt-auto border-t bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <Image
              src="/brand/footer-logo.png"
              alt="Nisvarthjan Seva Foundation"
              width={160}
              height={206}
              className="mb-4 h-auto w-32"
            />
            <p className="mb-4 text-sm italic text-muted-foreground">
              &ldquo;मानव सेवा ही सर्वोच्च सेवा है&rdquo;
            </p>
            <p className="text-sm text-muted-foreground">
              {t(
                "Dedicated to education, health, women empowerment, and rural development across India.",
                "भारत भर में शिक्षा, स्वास्थ्य, महिला सशक्तिकरण और ग्रामीण विकास के लिए समर्पित।",
              )}
            </p>
          </div>

          <div>
            <h4 className="mb-4 font-bold">{t("Quick Links", "त्वरित लिंक")}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-primary">{t("About Us", "हमारे बारे में")}</Link></li>
              <li><Link href="/mission" className="hover:text-primary">{t("Mission & Vision", "मिशन और विजन")}</Link></li>
              <li><Link href="/services" className="hover:text-primary">{t("Our Programs", "हमारे कार्यक्रम")}</Link></li>
              <li><Link href="/membership" className="hover:text-primary">{t("Join Us", "हमसे जुड़ें")}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-bold">{t("Legal", "कानूनी")}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/privacy" className="hover:text-primary">{t("Privacy Policy", "गोपनीयता नीति")}</Link></li>
              <li><Link href="/terms" className="hover:text-primary">{t("Terms & Conditions", "नियम और शर्तें")}</Link></li>
              <li><Link href="/verify" className="hover:text-primary">{t("Verify Certificate", "प्रमाणपत्र सत्यापित करें")}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-bold">{t("Connect", "संपर्क")}</h4>

            {[
            { icon: MapPin, title: t("Address", "पता"), text: t("C/o Mayank Singh Sikarwar, Vill. & Po. Tihar Thana, Rampura (Jalaun), Jalaun, Jalaun, Uttar Pradesh, India, 285127", " केयर ऑफ़ मयंक सिंह सिकरवार, ग्राम व पोस्ट तिहार थाना, रामपुरा (जालौन), जालौन, जालौन, उत्तर प्रदेश, भारत, 285127")} ,
            { icon: Phone, title: t("Phone", "फोन"), text: "+91 73806 26179 / +91 88516 26084" },
            { icon: Mail, title: t("Email", "ईमेल"), text: "nisvarthjansevango@gmail.com" },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex gap-4 p-2">
              <div className="">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground">{text}</p>
              </div>
            </div>
          ))}
           
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()}  {t("Nisvarthjan Seva Foundation | All rights reserved.", " निस्वार्थजन सेवा फाउंडेशन । सर्वाधिकार सुरक्षित।")}</p>
          <p className="mt-2">{t("Lic. No:", "लाइसेंस संख्या:")} 4889004P2025NPL231619</p>
        </div>
      </div>
    </footer>
  );
}
