"use client";
import { Layout } from "@/components/layout/Layout";
import { useLanguage } from "@/lib/language-context";

export default function Privacy() {
  const { t } = useLanguage();
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="text-4xl font-serif font-bold text-foreground mb-2">{t("Privacy Policy", "गोपनीयता नीति")}</h1>
        <p className="text-muted-foreground mb-8">{t("Last updated: May 2026", "अंतिम अपडेट: मई 2026")}</p>
        <div className="prose max-w-none text-foreground space-y-6">
          {[
            { h: t("1. Information We Collect", "1. हम जो जानकारी एकत्र करते हैं"), p: t("We collect personal information such as name, email, phone number, and address when you register as a member, make a donation, or fill out our contact form. We also collect technical information such as browser type and IP address.", "हम सदस्य के रूप में पंजीकरण करते समय, दान करते समय, या हमारे संपर्क फ़ॉर्म को भरते समय नाम, ईमेल, फोन नंबर और पता जैसी व्यक्तिगत जानकारी एकत्र करते हैं।") },
            { h: t("2. How We Use Your Information", "2. हम आपकी जानकारी का उपयोग कैसे करते हैं"), p: t("Your information is used to process membership registrations, donation receipts, and to communicate important updates about our programs and campaigns. We never sell your information to third parties.", "आपकी जानकारी का उपयोग सदस्यता पंजीकरण, दान रसीद, और हमारे कार्यक्रमों के बारे में महत्वपूर्ण अपडेट संप्रेषित करने के लिए किया जाता है।") },
            { h: t("3. Data Security", "3. डेटा सुरक्षा"), p: t("We implement industry-standard security measures to protect your personal information from unauthorized access, disclosure, or destruction. All financial transactions are processed through secure channels.", "हम आपकी व्यक्तिगत जानकारी को अनधिकृत पहुंच से बचाने के लिए उद्योग-मानक सुरक्षा उपाय लागू करते हैं।") },
            { h: t("4. Cookies", "4. कुकीज़"), p: t("Our website uses cookies to enhance user experience and analyze website traffic. You can disable cookies in your browser settings, though this may affect certain features of the website.", "हमारी वेबसाइट उपयोगकर्ता अनुभव को बेहतर बनाने और वेबसाइट ट्रैफ़िक का विश्लेषण करने के लिए कुकीज़ का उपयोग करती है।") },
            { h: t("5. Contact Us", "5. हमसे संपर्क करें"), p: t("If you have any questions about this Privacy Policy, please contact us at nisvarthjansevango@gmail.com", "यदि इस गोपनीयता नीति के बारे में आपके कोई प्रश्न हैं, तो कृपया nisvarthjansevango@gmail.com पर हमसे संपर्क करें।") },
          ].map(({ h, p }) => (
            <section key={h}>
              <h2 className="text-xl font-serif font-semibold text-foreground mb-3">{h}</h2>
              <p className="text-muted-foreground leading-relaxed">{p}</p>
            </section>
          ))}
        </div>
      </div>
    </Layout>
  );
}



