"use client";
import { ReactNode, useEffect } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { captureReferralCodeFromUrl } from "@/lib/referral-code";

export function Layout({ children }: { children: ReactNode }) {
  useEffect(() => {
    window.setTimeout(() => captureReferralCodeFromUrl(), 0);
  }, []);

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}




