"use client";
import { Layout } from "@/components/layout/Layout";
import { useLanguage } from "@/lib/language-context";

const services = [
  {
    id: "education",
    icon: "📚",
    title: { en: "Education for All", hi: "सभी के लिए शिक्षा" },
    desc: { en: "Providing school supplies, scholarships, and running evening classes for underprivileged children.", hi: "वंचित बच्चों के लिए स्कूल की आपूर्ति, छात्रवृत्ति प्रदान करना और शाम की कक्षाएं चलाना।" }
  },
  {
    id: "health",
    icon: "🏥",
    title: { en: "Healthcare Camps", hi: "स्वास्थ्य सेवा शिविर" },
    desc: { en: "Organizing free medical check-ups, eye camps, and distributing essential medicines in remote villages.", hi: "मुफ्त चिकित्सा जांच, नेत्र शिविर आयोजित करना और दूरदराज के गांवों में आवश्यक दवाएं वितरित करना।" }
  },
  {
    id: "women",
    icon: "👩",
    title: { en: "Women Empowerment", hi: "महिला सशक्तिकरण" },
    desc: { en: "Vocational training, micro-finance support, and awareness programs to make women financially independent.", hi: "महिलाओं को आर्थिक रूप से स्वतंत्र बनाने के लिए व्यावसायिक प्रशिक्षण, माइक्रो-फाइनेंस सहायता और जागरूकता कार्यक्रम।" }
  },
  {
    id: "environment",
    icon: "🌱",
    title: { en: "Environmental Protection", hi: "पर्यावरण संरक्षण" },
    desc: { en: "Tree plantation drives, waste management education, and promoting sustainable agricultural practices.", hi: "वृक्षारोपण अभियान, अपशिष्ट प्रबंधन शिक्षा और टिकाऊ कृषि प्रथाओं को बढ़ावा देना।" }
  },
  {
    id: "rural",
    icon: "🏘️",
    title: { en: "Rural Development", hi: "ग्रामीण विकास" },
    desc: { en: "Building basic infrastructure, clean drinking water facilities, and sanitation units in villages.", hi: "गांवों में बुनियादी ढांचे, स्वच्छ पेयजल सुविधाओं और स्वच्छता इकाइयों का निर्माण।" }
  },
  {
    id: "disaster",
    icon: "🤝",
    title: { en: "Disaster Relief", hi: "आपदा राहत" },
    desc: { en: "Rapid response during natural calamities, providing food, shelter, and rehabilitation support.", hi: "प्राकृतिक आपदाओं के दौरान त्वरित प्रतिक्रिया, भोजन, आश्रय और पुनर्वास सहायता प्रदान करना।" }
  }
];

export default function Services() {
  const { t, language } = useLanguage();

  return (
    <Layout>
      <div className="bg-primary/5 py-12 md:py-20 border-b">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4">
            {t("Our Programs", "हमारे कार्यक्रम")}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-serif">
            {t(
              "Comprehensive initiatives designed to create lasting, positive change.",
              "स्थायी, सकारात्मक बदलाव लाने के लिए डिज़ाइन की गई व्यापक पहल।"
            )}
          </p>
        </div>
      </div>
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <div key={service.id} className="bg-card rounded-2xl border p-8 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="text-4xl mb-6 bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center text-primary">
                <span className="opacity-0 w-0 h-0 overflow-hidden">{service.icon}</span>
                <div className="w-8 h-8 rounded-full bg-primary/20"></div>
              </div>
              <h3 className="text-2xl font-bold font-serif mb-4 text-foreground">
                {language === "hi" ? service.title.hi : service.title.en}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {language === "hi" ? service.desc.hi : service.desc.en}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}



