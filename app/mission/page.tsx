import { Layout } from "@/components/layout/Layout";
import { useLanguage } from "@/lib/language-context";

export default function Mission() {
  const { t } = useLanguage();

  return (
    <Layout>
      <div className="bg-primary/5 py-12 md:py-20 border-b">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4">
            {t("Mission & Vision", "मिशन और विजन")}
          </h1>
        </div>
      </div>
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          <div className="bg-card p-8 rounded-2xl shadow-sm border border-primary/20">
            <h2 className="text-3xl font-serif font-bold text-primary mb-6">
              {t("Our Mission", "हमारा मिशन")}
            </h2>
            <p className="text-lg leading-relaxed text-muted-foreground mb-6">
              {t(
                "To empower marginalized communities by providing access to quality education, healthcare, and sustainable livelihood opportunities, while fostering environmental stewardship and gender equality.",
                "गुणवत्तापूर्ण शिक्षा, स्वास्थ्य सेवा और टिकाऊ आजीविका के अवसरों तक पहुंच प्रदान करके हाशिए पर रहने वाले समुदायों को सशक्त बनाना, साथ ही पर्यावरण संरक्षण और लैंगिक समानता को बढ़ावा देना।"
              )}
            </p>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <span className="text-primary font-bold">•</span>
                <span>{t("Eradicate illiteracy in rural pockets", "ग्रामीण क्षेत्रों में निरक्षरता को खत्म करना")}</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold">•</span>
                <span>{t("Provide accessible preventative healthcare", "सुलभ निवारक स्वास्थ्य सेवा प्रदान करना")}</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold">•</span>
                <span>{t("Create self-help groups for women", "महिलाओं के लिए स्वयं सहायता समूह बनाना")}</span>
              </li>
            </ul>
          </div>
          <div className="bg-primary text-primary-foreground p-8 rounded-2xl shadow-sm">
            <h2 className="text-3xl font-serif font-bold mb-6">
              {t("Our Vision", "हमारा विजन")}
            </h2>
            <p className="text-lg leading-relaxed text-primary-foreground/90 font-serif text-xl italic">
              {t(
                "\"A society where every individual, regardless of their socio-economic background, has the opportunity to live a life of dignity, self-reliance, and holistic well-being.\"",
                "\"एक ऐसा समाज जहां हर व्यक्ति को, उसकी सामाजिक-आर्थिक पृष्ठभूमि की परवाह किए बिना, सम्मान, आत्मनिर्भरता और समग्र कल्याण का जीवन जीने का अवसर मिले।\""
              )}
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
