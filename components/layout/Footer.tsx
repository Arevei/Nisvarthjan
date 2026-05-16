"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";

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
                "Dedicated to education, health, women empowerment, and rural development across India.",
              )}
            </p>
          </div>

          <div>
            <h4 className="mb-4 font-bold">{t("Quick Links", "Quick Links")}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-primary">{t("About Us", "About Us")}</Link></li>
              <li><Link href="/mission" className="hover:text-primary">{t("Mission & Vision", "Mission & Vision")}</Link></li>
              <li><Link href="/services" className="hover:text-primary">{t("Our Programs", "Our Programs")}</Link></li>
              <li><Link href="/membership" className="hover:text-primary">{t("Join Us", "Join Us")}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-bold">{t("Legal", "Legal")}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/privacy" className="hover:text-primary">{t("Privacy Policy", "Privacy Policy")}</Link></li>
              <li><Link href="/terms" className="hover:text-primary">{t("Terms & Conditions", "Terms & Conditions")}</Link></li>
              <li><Link href="/verify" className="hover:text-primary">{t("Verify Certificate", "Verify Certificate")}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-bold">{t("Connect", "Connect")}</h4>
            <p className="mb-3 text-sm text-muted-foreground">
              {t("Office Location: Tihar and Rampura", "Office Location: Tihar and Rampura")}
            </p>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Nisvarthjan Seva Foundation. All rights reserved.</p>
          <p className="mt-2">Lic. No: 4889004P2025NPL231619</p>
        </div>
      </div>
    </footer>
  );
}
