import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Nisvarthjan Seva Foundation",
    template: "%s | Nisvarthjan Seva Foundation",
  },
  description:
    "Nisvarthjan Seva Foundation is dedicated to education, healthcare, women empowerment, environmental protection, and rural development across India.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>

        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-1WWZ82JGB9"
          strategy="afterInteractive"
        />

        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-1WWZ82JGB9');
          `}
        </Script>


<script src="Scripts/jspdf/png_support/zlib.js"></script>
<script src="Scripts/jspdf/png_support/png.js"></script>
<script src="Scripts/jspdf/FileSaver.js"></script>
<script src="Scripts/jspdf/jspdf.js"></script>
<script src="Scripts/jspdf/jspdf.plugin.addimage.js"></script>
<script src="Scripts/jspdf/jspdf.plugin.png_support.js"></script>

      </body>
    </html>
  );
}


