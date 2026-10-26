import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./theme.css";
import "./i18n.css";
import "./hero.css";
import "./controls.css";
import "./day-night.css";
import "./gallery.css";
import "./availability.css";
import "./header-controls.css";
import { SiteChrome } from "@/components/site-chrome";
import { Footer } from "@/components/footer";
import { LocaleProvider } from "@/lib/i18n";
import {getWebsiteContent} from "@/lib/site-content";

import { defaultOgImage, siteDescription, siteKeywords, siteName, siteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Location de voiture à Oran — Démonstration | Chawki Auto Oran", template: "%s | Chawki Auto Oran" },
  description: siteDescription,
  keywords: siteKeywords,
  applicationName: siteName,
  authors: [{ name: siteName, url: siteUrl }],
  creator: siteName,
  publisher: siteName,
  category: "Location de voitures",
  openGraph: { type: "website", url: "/", siteName, locale: "fr_DZ", alternateLocale: ["en_US", "ar_DZ"], title: "Location de voiture à Oran — Chawki Auto Oran", description: siteDescription, images: [defaultOgImage] },
  twitter: { card: "summary_large_image", title: "Location de voiture à Oran — Chawki Auto Oran", description: siteDescription, images: [defaultOgImage.url] },
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
  formatDetection: { telephone: true, email: true, address: true },
  icons: { icon: "/brand/favicon.svg", apple: "/brand/favicon.svg" },
  ...(process.env.GOOGLE_SITE_VERIFICATION ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } } : {}),
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#161B23" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const {site}=getWebsiteContent();
  const defaultTheme=site.appearance.mode;
  return <html lang="fr" data-scroll-behavior="smooth" data-theme="dark" style={{"--gold":site.appearance.accent,"--y":site.appearance.accent} as React.CSSProperties} suppressHydrationWarning>
    <head>
      <script dangerouslySetInnerHTML={{ __html: `(function(){try{var saved=localStorage.getItem('chawki-theme');var theme=saved==='light'?'light':saved==='dark'?'dark':('${defaultTheme}'==='auto'?(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'):'${defaultTheme}');document.documentElement.dataset.theme=theme;document.documentElement.style.colorScheme=theme;}catch(e){}})();` }} />
      <script dangerouslySetInnerHTML={{ __html: `(function(){try{var l=localStorage.getItem("chawki-language");l=(l==="en"||l==="ar")?l:"fr";document.documentElement.lang=l;document.documentElement.dir=l==="ar"?"rtl":"ltr";document.documentElement.dataset.locale=l;}catch(e){}})();` }} />
    </head>
    <body><LocaleProvider><SiteChrome footer={<Footer />}>{children}</SiteChrome></LocaleProvider></body>
  </html>;
}
