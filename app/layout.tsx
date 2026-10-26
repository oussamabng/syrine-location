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
import { JsonLd } from "@/components/json-ld";
import { businessJsonLd, defaultOgImage, siteDescription, siteKeywords, siteName, siteUrl, websiteJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Location de voiture à Oran – Livraison aéroport gratuite | Syrine", template: "%s | Syrine Location de Voitures Oran" },
  description: siteDescription,
  keywords: siteKeywords,
  applicationName: siteName,
  authors: [{ name: siteName, url: siteUrl }],
  creator: siteName,
  publisher: siteName,
  category: "Location de voitures",
  openGraph: { type: "website", url: "/", siteName, locale: "fr_DZ", alternateLocale: ["en_US", "ar_DZ"], title: "Location de voiture à Oran – Syrine", description: siteDescription, images: [defaultOgImage] },
  twitter: { card: "summary_large_image", title: "Location de voiture à Oran – Syrine", description: siteDescription, images: [defaultOgImage.url] },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  formatDetection: { telephone: true, email: true, address: true },
  icons: { icon: "/brand/favicon.svg", apple: "/brand/favicon.svg" },
  ...(process.env.GOOGLE_SITE_VERIFICATION ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } } : {}),
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#111615" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const {site}=getWebsiteContent();
  const defaultTheme=site.appearance.mode;
  return <html lang="fr" data-scroll-behavior="smooth" data-theme="dark" style={{"--gold":site.appearance.accent,"--y":site.appearance.accent} as React.CSSProperties} suppressHydrationWarning>
    <head>
      <script dangerouslySetInnerHTML={{ __html: `(function(){try{var saved=localStorage.getItem('syrine-theme');var theme=saved==='light'?'light':saved==='dark'?'dark':('${defaultTheme}'==='auto'?(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'):'${defaultTheme}');document.documentElement.dataset.theme=theme;document.documentElement.style.colorScheme=theme;}catch(e){}})();` }} />
      <script dangerouslySetInnerHTML={{ __html: `(function(){try{var l=localStorage.getItem("syrine-language");l=(l==="en"||l==="ar")?l:"fr";document.documentElement.lang=l;document.documentElement.dir=l==="ar"?"rtl":"ltr";document.documentElement.dataset.locale=l;}catch(e){}})();` }} />
    </head>
    <body><JsonLd data={[businessJsonLd(site.contact), websiteJsonLd()]} /><LocaleProvider><SiteChrome footer={<Footer />}>{children}</SiteChrome></LocaleProvider></body>
  </html>;
}
