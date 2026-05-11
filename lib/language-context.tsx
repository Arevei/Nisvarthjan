"use client";
import { createContext, useContext, useState, ReactNode, useEffect } from "react";

type Language = "en" | "hi";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (en: string | null | undefined, hi: string | null | undefined) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("hi");

  useEffect(() => {
    const saved = window.localStorage.getItem("language");
    if (saved === "en" || saved === "hi") {
      setLanguage(saved);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("language", language);
  }, [language]);

  const t = (en: string | null | undefined, hi: string | null | undefined) => {
    if (language === "hi") {
      return hi || en || "";
    }
    return en || hi || "";
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




