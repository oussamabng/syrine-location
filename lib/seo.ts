import type { Metadata } from "next";
import { contact, type Vehicle } from "@/lib/data";

/** Public origin used for canonical URLs, the sitemap and social previews.
 *  Set PUBLIC_ORIGIN in .env on the server; the placeholder value is ignored. */
const envOrigin = process.env.PUBLIC_ORIGIN?.replace(/\/+$/, "");
export const siteUrl = envOrigin && !envOrigin.includes("example") ? envOrigin : "http://localhost:3001";

export const siteName = "Chawki Auto Oran — Proposition de refonte";
export const siteTagline = "Location de voiture à Oran";
export const siteDescription =
  "Proposition indépendante de refonte de site pour Chawki Auto Oran. Véhicules et prix illustratifs, sans réservation active ni affiliation officielle.";
export const siteKeywords = [
  "location voiture Oran", "location de voiture Oran", "location voiture aéroport Oran", "location voiture Es-Sénia",
  "louer voiture Oran", "location voiture Algérie", "car rental Oran", "car rental Oran airport", "تأجير السيارات وهران",
  "كراء السيارات وهران", "Chawki Auto Oran",
];
export const socialProfiles = [];
export const defaultOgImage = { url: "/hero/airport-arrival.webp", width: 1672, height: 941, alt: "Maquette de site de location auto Chawki Auto Oran" };

export const absoluteUrl = (path = "/") => new URL(path, siteUrl).toString();

/** Page-level metadata with a canonical URL and matching Open Graph / Twitter tags. */
export function pageMetadata({ title, description, path, image }: { title: string; description: string; path: string; image?: { url: string; alt: string } }): Metadata {
  const images = [image || defaultOgImage];
  return {
    title,
    description,
    robots: {index:false,follow:false},
    alternates: { canonical: path },
    openGraph: { type: "website", url: path, title, description, siteName, locale: "fr_DZ", images },
    twitter: { card: "summary_large_image", title, description, images: images.map(i => i.url) },
  };
}

/* ---------- Structured data (schema.org JSON-LD) ---------- */

export function businessJsonLd(site?: { phone?: string; email?: string; map?: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "AutoRental",
    "@id": `${siteUrl}/#business`,
    name: siteName,
    alternateName: ["Chawki Auto Oran", "Maquette indépendante de site auto"],
    description: siteDescription,
    url: siteUrl,
    logo: absoluteUrl("/brand/chawki-logo.svg"),
    image: absoluteUrl(defaultOgImage.url),
    telephone: site?.phone || contact.phoneDial,
    email: site?.email || contact.email,
    priceRange: "Tarifs illustratifs",
    currenciesAccepted: "DZD, EUR",
    address: { "@type": "PostalAddress", addressLocality: "Oran", addressRegion: "Oran", addressCountry: "DZ" },
    areaServed: [{ "@type": "City", name: "Oran" }, { "@type": "Airport", name: "Aéroport d’Oran Ahmed Ben Bella (Es-Sénia)", iataCode: "ORN" }],
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "00:00", closes: "23:59",
    },
    ...(site?.map ? { hasMap: site.map } : {}),
    sameAs: socialProfiles,
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    url: siteUrl,
    name: siteName,
    inLanguage: ["fr", "en", "ar"],
    publisher: { "@id": `${siteUrl}/#business` },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({ "@type": "ListItem", position: i + 1, name: item.name, item: absoluteUrl(item.path) })),
  };
}

export function vehicleJsonLd(v: Vehicle) {
  const path = `/vehicules/${v.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": ["Product", "Car"],
    "@id": `${absoluteUrl(path)}#vehicle`,
    name: `${v.name} ${v.year}`,
    brand: { "@type": "Brand", name: v.brand },
    model: v.name,
    vehicleModelDate: String(v.year),
    color: v.color,
    vehicleTransmission: v.transmission,
    vehicleSeatingCapacity: v.seats,
    bodyType: v.category,
    image: (v.images?.length ? v.images : [v.photo]).map(src => absoluteUrl(src)),
    description: v.descriptions?.fr || `Location ${v.name} ${v.year} (${v.transmission.toLowerCase()}, ${v.color.toLowerCase()}) à Oran, à partir de ${v.priceDzd} DA par jour. Livraison gratuite à l’aéroport d’Oran.`,
    url: absoluteUrl(path),
    offers: {
      "@type": "Offer",
      url: absoluteUrl(path),
      price: v.priceDzd,
      priceCurrency: "DZD",
      availability: "https://schema.org/InStock",
      priceSpecification: { "@type": "UnitPriceSpecification", price: v.priceDzd, priceCurrency: "DZD", unitText: "jour", referenceQuantity: { "@type": "QuantitativeValue", value: 1, unitCode: "DAY" } },
      seller: { "@id": `${siteUrl}/#business` },
      areaServed: "Oran",
    },
  };
}

export function faqJsonLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map(item => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })),
  };
}
