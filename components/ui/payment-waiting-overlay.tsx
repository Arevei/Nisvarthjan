"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface PaymentWaitingOverlayProps {
  isVisible: boolean;
  message?: string;
  subMessage?: string;
}

export function PaymentWaitingOverlay({
  isVisible,
  message = "Verifying your payment...",
  subMessage = "Please do not refresh or close this page. This may take a few seconds.",
}: PaymentWaitingOverlayProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
    } else {
      const timer = setTimeout(() => setShow(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="mx-4 w-full max-w-sm rounded-2xl border bg-card p-8 text-center shadow-2xl">
        <div className="relative mb-6 flex justify-center">
          <div className="absolute h-16 w-16 animate-ping rounded-full bg-primary/20" />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
        <h3 className="mb-2 text-xl font-serif font-bold text-foreground">{message}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {subMessage}
        </p>
        
        {/* Animated Progress Bar */}
        <div className="mt-8 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full w-1/2 animate-[shimmer_1.5s_infinite] rounded-full bg-primary" 
               style={{
                 backgroundImage: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                 backgroundSize: '200% 100%'
               }}
          />
        </div>
      </div>
      
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
}
