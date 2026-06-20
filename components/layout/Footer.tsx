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
              <li><Link href="/#mission" className="hover:text-primary">{t("Mission & Vision", "मिशन और विजन")}</Link></li>
              <li><Link href="/services" className="hover:text-primary">{t("Our Programs", "हमारे कार्यक्रम")}</Link></li>
              <li><Link href="/membership" className="hover:text-primary">{t("New Member Registration", "नया सदस्य पंजीकरण")}</Link></li>
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

            <div className="flex gap-4 p-2">
              <div className="shrink-0">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">{t("Address", "पता")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t(
                    "C/o Mayank Singh Sikarwar, Vill. & Po. Tihar Thana, Rampura (Jalaun), Jalaun, Jalaun, Uttar Pradesh, India, 285127",
                    " केयर ऑफ़ मयंक सिंह सिकरवार, ग्राम व पोस्ट टीहर थाना, रामपुरा (जालौन), जालौन, जालौन, उत्तर प्रदेश, भारत, 285127"
                  )}
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-2">
              <div className="shrink-0">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">{t("Phone", "फोन")}</h3>
                <div className="flex flex-col gap-1 text-sm">
                  <a href="tel:+917380626179" className="text-muted-foreground hover:text-primary transition-colors">
                    +91 73806 26179
                  </a>
                  <a href="tel:+918851626084" className="text-muted-foreground hover:text-primary transition-colors">
                    +91 88516 26084
                  </a>
                </div>
              </div>
            </div>

            <div className="flex gap-4 p-2">
              <div className="shrink-0">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">{t("Email", "ईमेल")}</h3>
                <a 
                  href="https://mail.google.com/mail/u/0/?to=nisvarthjansevango@gmail.com&su=Niswarthjan+Seva+Foundation+Support&fs=1&tf=cm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden md:inline text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  nisvarthjansevango@gmail.com
                </a>
                <a 
                  href="mailto:nisvarthjansevango@gmail.com?subject=Niswarthjan+Seva+Foundation+Support"
                  className="md:hidden text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  nisvarthjansevango@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()}  {t("Nisvarthjan Seva Foundation | All rights reserved.", " निस्वार्थजन सेवा फाउंडेशन । सर्वाधिकार सुरक्षित।")}</p>
          <p className="mt-2">{t("Lic. No:", "लाइसेंस संख्या:")} 4889004P2025NPL231619</p>
          <p className="mt-3 text-xs text-muted-foreground/70">Powered by <Link href="https://www.arevei.com/" className=" text-pink-400 hover:text-pink-500">Arevei</Link></p>
        </div>
      </div>
    </footer>
  );
}
