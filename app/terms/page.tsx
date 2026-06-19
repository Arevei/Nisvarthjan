"use client";
import { Layout } from "@/components/layout/Layout";
import { useLanguage } from "@/lib/language-context";

export default function Terms() {
  const { t } = useLanguage();
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="text-4xl font-serif font-bold text-foreground mb-2">{t("Terms & Conditions", "नियम और शर्तें")}</h1>
        <p className="text-muted-foreground mb-8">{t("Last updated: May 2026", "अंतिम अपडेट: मई 2026")}</p>
        <div className="prose max-w-none text-foreground space-y-6">
          <section>
            <h2 className="text-xl font-serif font-semibold text-foreground mb-3">{t("1. Acceptance of Terms", "1. शर्तों की स्वीकृति")}</h2>
            <p className="text-muted-foreground leading-relaxed">{t("By accessing and using this website, you accept and agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, please do not use our website.", "इस वेबसाइट तक पहुंचकर और उसका उपयोग करके, आप इन नियमों और शर्तों से बाध्य होने के लिए सहमत होते हैं।")}</p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-semibold text-foreground mb-3">{t("2. Membership", "2. सदस्यता")}</h2>
            <p className="text-muted-foreground leading-relaxed">{t("Membership registration requires accurate and complete information. The foundation reserves the right to revoke membership in case of misrepresentation or violation of our code of conduct. Membership IDs are non-transferable.", "सदस्यता पंजीकरण के लिए सटीक और पूर्ण जानकारी आवश्यक है। फाउंडेशन गलत बयानबाजी या आचार संहिता के उल्लंघन पर सदस्यता रद्द करने का अधिकार सुरक्षित रखता है।")}</p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-semibold text-foreground mb-3">{t("3. Donations", "3. दान")}</h2>
            <p className="text-muted-foreground leading-relaxed">{t("All donations made through this website are voluntary. Donation receipts are issued for all contributions. The foundation uses donations exclusively for its charitable programs as described on this website. Refunds are issued as per our Refund Policy.", "इस वेबसाइट के माध्यम से किए गए सभी दान स्वैच्छिक हैं। सभी योगदानों के लिए दान रसीदें जारी की जाती हैं।")}</p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-semibold text-foreground mb-3">{t("4. Intellectual Property", "4. बौद्धिक संपदा")}</h2>
            <p className="text-muted-foreground leading-relaxed">{t("All content on this website, including text, images, and logos, is the property of Nisvarthjan Seva Foundation and is protected by copyright laws. Unauthorized use of our content is strictly prohibited.", "इस वेबसाइट पर सभी सामग्री, जिसमें टेक्स्ट, चित्र और लोगो शामिल हैं, निस्वार्थजन सेवा फाउंडेशन की संपत्ति है।")}</p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-semibold text-foreground mb-3">{t("5. Refund Policy", "5. रिफंड नीति")}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t("Donations are generally non-refundable. However, in exceptional circumstances, refund requests may be considered within 7 days of the donation. Please contact us at", "दान आम तौर पर गैर-वापसी योग्य हैं। हालांकि, असाधारण परिस्थितियों में, दान के 7 दिनों के भीतर धनवापसी अनुरोधों पर विचार किया जा सकता है। हमसे संपर्क करें")}{" "}
              <a href="https://mail.google.com/mail/u/0/?to=nisvarthjansevango@gmail.com&su=Refund+Request&fs=1&tf=cm" target="_blank" rel="noopener noreferrer" className="hidden md:inline text-primary hover:underline">nisvarthjansevango@gmail.com</a>
              <a href="mailto:nisvarthjansevango@gmail.com?subject=Refund+Request" className="md:hidden text-primary hover:underline">nisvarthjansevango@gmail.com</a>
              {" "}
              {t("for refund-related queries.", "धनवापसी से संबंधित प्रश्नों के लिए।")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-semibold text-foreground mb-3">{t("6. Governing Law", "6. शासी कानून")}</h2>
            <p className="text-muted-foreground leading-relaxed">{t("These Terms are governed by the laws of India. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of courts in Prayagraj, Uttar Pradesh, India.", "ये नियम भारत के कानूनों द्वारा शासित हैं। इन शर्तों से उत्पन्न होने वाले किसी भी विवाद के लिए प्रयागराज, उत्तर प्रदेश के न्यायालयों का अधिकार क्षेत्र होगा।")}</p>
          </section>
        </div>
      </div>
    </Layout>
  );
}



