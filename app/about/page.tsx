"use client";
import { Layout } from "@/components/layout/Layout";
import { useLanguage } from "@/lib/language-context";

export default function About() {
  const { t } = useLanguage();

  return (
    <Layout>
      <div className="bg-primary/5 py-12 md:py-20 border-b">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4">
            {t("About Us", "हमारे बारे में")}
          </h1>
          <p className="text-xl text-muted-foreground mx-auto max-w-2xl font-serif">
            {t(
              "A journey of selfless service dedicated to uplifting the most vulnerable sections of society.",
              "समाज के सबसे कमजोर वर्गों के उत्थान के लिए समर्पित निस्वार्थ सेवा की एक यात्रा।"
            )}
          </p>
        </div>
      </div>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto prose prose-lg prose-red dark:prose-invert">
          <p>
            {t(
              "Nisvarthjan Seva Foundation was founded with a singular, unwavering mission: to serve humanity without any expectation of reward. We believe that true fulfillment comes from lifting others up and creating pathways of opportunity for those left behind by circumstances.",
              "निस्वार्थजन सेवा फाउंडेशन की स्थापना एक ही अटूट मिशन के साथ की गई थी: बिना किसी प्रतिफल की अपेक्षा के मानवता की सेवा करना। हमारा मानना ​​है कि सच्ची तृप्ति दूसरों को ऊपर उठाने और परिस्थितियों के कारण पीछे छूट गए लोगों के लिए अवसर के रास्ते बनाने से मिलती है।"
            )}
          </p>
          <p>
            {t(
              "Operating primarily in rural and semi-urban regions of India, our foundation focuses on critical pillars of societal development: Education, Healthcare, Women's Empowerment, Environmental Conservation, and Disaster Relief.",
              "मुख्य रूप से भारत के ग्रामीण और अर्ध-शहरी क्षेत्रों में काम करते हुए, हमारा फाउंडेशन सामाजिक विकास के महत्वपूर्ण स्तंभों पर ध्यान केंद्रित करता है: शिक्षा, स्वास्थ्य सेवा, महिला सशक्तिकरण, पर्यावरण संरक्षण और आपदा राहत।"
            )}
          </p>
          <h2>{t("Our Core Values", "हमारे मूल मूल्य")}</h2>
          <ul>
            <li><strong>{t("Seva (Selfless Service)", "सेवा (निस्वार्थ सेवा)")}</strong> - {t("Serving without borders, biases, or expectations.", "बिना किसी सीमा, पूर्वाग्रह या अपेक्षा के सेवा करना।")}</li>
            <li><strong>{t("Integrity", "ईमानदारी")}</strong> - {t("Utmost transparency in our operations and utilization of funds.", "हमारे संचालन और धन के उपयोग में अत्यंत पारदर्शिता।")}</li>
            <li><strong>{t("Compassion", "करुणा")}</strong> - {t("Approaching every individual with empathy and respect.", "हर व्यक्ति से सहानुभूति और सम्मान के साथ संपर्क करना।")}</li>
            <li><strong>{t("Sustainability", "स्थिरता")}</strong> - {t("Creating long-term solutions, not just temporary fixes.", "सिर्फ अस्थायी समाधान नहीं, बल्कि दीर्घकालिक समाधान बनाना।")}</li>
          </ul>
        </div>

        <section className="max-w-6xl mx-auto mt-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
              {t("Leadership Team", "नेतृत्व टीम")}
            </h2>
            <p className="text-muted-foreground mt-2">
              {t("Founder, Secretary and Treasurer", "संस्थापक, सचिव और कोषाध्यक्ष")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {name:"Mayank Singh", hname:"मयंक सिंह", roleEn: "Founder", roleHi: "संस्थापक", image: "/leadership/Founder.jpg" },
              {name:"Hemant Pratap Singh", hname:"हेमंत प्रताप सिंह", roleEn: "Vice president", roleHi: "उपाध्यक्ष", image: "/leadership/vice-president.jpeg" },
              {name:"Punit Tiwari", hname:"पुनीत तिवारी", roleEn: "Treasurer", roleHi: "कोषाध्यक्ष ", image: "/leadership/Treasurer.jpg" },
              {name:"Himani Tiwari", hname:"हिमानी तिवारी", roleEn: "Secretary , Social Affairs", roleHi: "सचिव, सामाजिक मामले", image: "/leadership/Secretary.jpg" },
              
            ].map((member) => (
              <div key={member.roleEn} className="bg-card border rounded-2xl overflow-hidden shadow-sm">
                <img
                  src={member.image}
                  alt={member.roleEn}
                  className="w-full aspect-[4/5] object-cover"
                />
                <div className="p-4 text-center">
                  <p className=" font-semibold text-xl">{t(member.name,member.hname)}</p>
                  <h3 className=" text-lg font-serif  text-foreground">
                    {t(member.roleEn, member.roleHi)}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
}



