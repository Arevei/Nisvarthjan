"use client";
import { createContext, useContext, useState, ReactNode, useEffect } from "react";

type Language = "en" | "hi";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (en: string | null | undefined, hi: string | null | undefined) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const fallbackHindi: Record<string, string> = {
  "Member Dashboard": "सदस्य डैशबोर्ड",
  Logout: "लॉग आउट",
  "About Us": "हमारे बारे में",
  Programs: "कार्यक्रम",
  Campaigns: "अभियान",
  News: "समाचार",
  "Activity Post": "गतिविधि पोस्ट",
  Contact: "संपर्क",
  Dashboard: "डैशबोर्ड",
  Login: "लॉगिन",
  "Member Login": "सदस्य लॉगिन",
  "Access your member dashboard": "अपने सदस्य डैशबोर्ड तक पहुंचें",
  "Email Address": "ईमेल पता",
  Password: "पासवर्ड",
  "Logging in...": "लॉगिन हो रहा है...",
  "Welcome back!": "आपका फिर से स्वागत है!",
  "Invalid email or password": "ईमेल या पासवर्ड गलत है",
  "Not a member yet?": "अभी सदस्य नहीं हैं?",
  "Register here": "यहां पंजीकरण करें",
  Member: "सदस्य",
  "Member workspace": "सदस्य कार्यक्षेत्र",
  "Membership ID": "सदस्यता आईडी",
  "Member Type": "सदस्य प्रकार",
  "Joined On": "जुड़ने की तारीख",
  "Profile Badge": "प्रोफाइल बैज",
  "Badge Pending": "बैज लंबित",
  "Silver Badge": "सिल्वर बैज",
  "Gold Badge": "गोल्ड बैज",
  "Platinum Badge": "प्लैटिनम बैज",
  "Diamond Badge": "डायमंड बैज",
  "Donation History": "दान इतिहास",
  "Download History PDF": "इतिहास PDF डाउनलोड करें",
  "Digital ID": "डिजिटल आईडी",
  "Membership ID Card": "सदस्यता आईडी कार्ड",
  "Professional member identity card with QR verification.": "QR सत्यापन के साथ पेशेवर सदस्य पहचान पत्र।",
  "Download ID Card": "आईडी कार्ड डाउनलोड करें",
  "Download Center": "डाउनलोड केंद्र",
  "Allotted Documents": "आवंटित दस्तावेज़",
  "Membership Certificate": "सदस्यता प्रमाणपत्र",
  Certificate: "प्रमाणपत्र",
  Verify: "सत्यापित करें",
  "Membership Receipt": "सदस्यता रसीद",
  Receipt: "रसीद",
  "Fee receipt PDF with QR verification.": "QR सत्यापन के साथ शुल्क रसीद PDF।",
  "Achievement Certificate": "उपलब्धि प्रमाणपत्र",
  Achievement: "उपलब्धि",
  "Not allotted yet": "अभी आवंटित नहीं",
  "Certificate pending": "प्रमाणपत्र लंबित",
  "Member Photo": "सदस्य फोटो",
  "Member Signature": "सदस्य हस्ताक्षर",
  "Authority Signature": "प्राधिकृत हस्ताक्षर",
  "Allotted certificate": "आवंटित प्रमाणपत्र",
  "Donation collection": "दान संग्रह",
  "Badge & Certificate Progress": "बैज और प्रमाणपत्र प्रगति",
  "Follow the next badge target. Future achievements open after the current badge is reached.": "अगले बैज लक्ष्य को पूरा करें। वर्तमान बैज पूरा होने के बाद आगे की उपलब्धियां खुलेंगी।",
  "Next achievement": "अगली उपलब्धि",
  "Complete these targets to unlock your next certificate.": "अपना अगला प्रमाणपत्र खोलने के लिए ये लक्ष्य पूरे करें।",
  "In progress": "प्रगति में",
  "Membership referrals": "सदस्यता रेफरल",
  "Donation referrals": "दान रेफरल",
  "Current target": "वर्तमान लक्ष्य",
  Upcoming: "आगामी",
  Completed: "पूर्ण",
  "All badge achievements unlocked": "सभी बैज उपलब्धियां खुल गईं",
  "Your Silver, Gold, Platinum, and Diamond achievement certificates are complete.": "आपके सिल्वर, गोल्ड, प्लैटिनम और डायमंड उपलब्धि प्रमाणपत्र पूरे हो गए हैं।",
  "Loading certificate progress...": "प्रमाणपत्र प्रगति लोड हो रही है...",
  "Referral Link": "रेफरल लिंक",
  "Share one link for the whole website. When someone opens it, your referral code applies for that browser session only.": "पूरी वेबसाइट के लिए एक लिंक साझा करें। कोई इसे खोले तो आपका रेफरल कोड केवल उस ब्राउज़र सत्र के लिए लागू होगा।",
  "Website Referral": "वेबसाइट रेफरल",
  "Referral code": "रेफरल कोड",
  "Copy Link": "लिंक कॉपी करें",
  "Copy Code": "कोड कॉपी करें",
  Copied: "कॉपी हुआ",
  "Personal Information": "व्यक्तिगत जानकारी",
  "Quick Links": "त्वरित लिंक",
  "Mission & Vision": "मिशन और विजन",
  "Our Programs": "हमारे कार्यक्रम",
  "Join Us": "हमसे जुड़ें",
  Legal: "कानूनी",
  "Privacy Policy": "गोपनीयता नीति",
  "Terms & Conditions": "नियम और शर्तें",
  "Verify Certificate": "प्रमाणपत्र सत्यापित करें",
  Connect: "संपर्क",
  "Office Location: Tihar and Rampura": "कार्यालय स्थान: तिहार और रामपुरा",
  "Dedicated to education, health, women empowerment, and rural development across India.": "भारत भर में शिक्षा, स्वास्थ्य, महिला सशक्तिकरण और ग्रामीण विकास के लिए समर्पित।",
  "All rights reserved.": "सर्वाधिकार सुरक्षित।",
  "Lic. No:": "लाइसेंस संख्या:",
  "Recent Activity Posts": "हाल की गतिविधि पोस्ट",
  "View Activity Posts": "गतिविधि पोस्ट देखें",
  "Document Verification": "दस्तावेज़ सत्यापन",
  "Scan a QR code or enter a verification number to confirm documents issued by Nisvarthjan Seva Foundation.": "Nisvarthjan Seva Foundation द्वारा जारी दस्तावेज़ों की पुष्टि के लिए QR कोड स्कैन करें या सत्यापन नंबर दर्ज करें।",
  "Verification / Certificate Number *": "सत्यापन / प्रमाणपत्र नंबर *",
  "Mobile / Email (optional)": "मोबाइल / ईमेल (वैकल्पिक)",
  "Optional extra check": "वैकल्पिक अतिरिक्त जांच",
  "Verifying...": "सत्यापित हो रहा है...",
  "Verify Document": "दस्तावेज़ सत्यापित करें",
  "Verified Document": "सत्यापित दस्तावेज़",
  "Document Not Verified": "दस्तावेज़ सत्यापित नहीं हुआ",
  "Verification ID": "सत्यापन आईडी",
  "Certificate No.": "प्रमाणपत्र नंबर",
  "Issued To": "जारी किया गया",
  "Issued On": "जारी तिथि",
  Status: "स्थिति",
  Verified: "सत्यापित",
  "No valid active document was found for this verification number.": "इस सत्यापन नंबर के लिए कोई मान्य सक्रिय दस्तावेज़ नहीं मिला।",
  "Minimum donation amount is Rs 100": "न्यूनतम दान राशि Rs 100 है",
  Mobile: "मोबाइल",
  "Date of Birth": "जन्म तिथि",
  City: "शहर",
  State: "राज्य",
  Address: "पता",
  "Not available": "उपलब्ध नहीं",
  "Registration Form": "पंजीकरण फॉर्म",
  "Become a Member": "सदस्य बनें",
  "Full Name *": "पूरा नाम *",
  "Email *": "ईमेल *",
  "Phone *": "फोन *",
  "Membership fee": "सदस्यता शुल्क",
  "Opening Razorpay...": "Razorpay खुल रहा है...",
  "Donating as": "दानकर्ता",
  Donations: "दान",
  "Total Given": "कुल दान",
  "Password *": "पासवर्ड *",
  "Membership Type": "सदस्यता प्रकार",
  "Submit & Continue": "जमा करें और आगे बढ़ें",
  Submitting: "जमा हो रहा है",
  "Request Submitted": "अनुरोध जमा हुआ",
  "Complete Membership Payment": "सदस्यता भुगतान पूरा करें",
  "Pay with Razorpay": "Razorpay से भुगतान करें",
  "Your Donation Changes Lives": "आपका दान जीवन बदलता है",
  "Make a Donation": "दान करें",
  "Donate Now": "अभी दान करें",
  "Donation Successful!": "दान सफल!",
  "Download Receipt": "रसीद डाउनलोड करें",
  "Verify Receipt": "रसीद सत्यापित करें",
  "Donate Again": "फिर से दान करें",
  "Support This Campaign": "इस अभियान का समर्थन करें",
  "All Campaigns": "सभी अभियान",
  Raised: "एकत्रित",
  donors: "दानकर्ता",
  funded: "वित्त पोषित",
  "Please fill all required fields": "कृपया सभी आवश्यक फ़ील्ड भरें",
  "Please fill all fields": "कृपया सभी फ़ील्ड भरें",
  "Processing...": "प्रसंस्करण...",
};

function repairMojibake(value: string) {
  if (!/[ÃÂàð]/.test(value)) return value;

  try {
    const bytes = Uint8Array.from(value, (char) => char.charCodeAt(0) & 0xff);
    return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  } catch {
    return value;
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("hi");

  useEffect(() => {
    async function initializeLanguage() {
      const saved = window.localStorage.getItem("language");
      if (saved === "en" || saved === "hi") {
        setLanguageState(saved);
        return;
      }

      try {
        const response = await fetch("/api/site-settings/default-language");
        if (response.ok) {
          const data = (await response.json()) as { defaultLanguage?: Language };
          if (data.defaultLanguage === "en" || data.defaultLanguage === "hi") {
            setLanguageState(data.defaultLanguage);
          }
        }
      } catch {
        // Keep Hindi fallback when the setting is unavailable.
      }
    }

    void initializeLanguage();
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    window.localStorage.setItem("language", lang);
  };

  const t = (en: string | null | undefined, hi: string | null | undefined) => {
    const english = en || hi || "";
    const hindi = hi && hi !== en ? hi : fallbackHindi[english] || hi || en || "";
    if (language === "hi") {
      return repairMojibake(hindi);
    }
    return repairMojibake(english);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}




