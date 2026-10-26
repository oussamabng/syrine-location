export type Transmission = "Automatique" | "Manuelle";
export type Vehicle = {
  slug: string;
  name: string;
  brand: string;
  year: number;
  color: string;
  transmission: Transmission;
  priceDzd: number;
  priceEur: number;
  photo: string;
  images?: string[];
  descriptions?: {fr?:string;en?:string;ar?:string};
  category: "SUV" | "Citadine" | "Berline" | "Compacte";
  seats: number;
  luggage: number;
  featured?: boolean;
  note?: string;
};


export const vehicles: Vehicle[] = [
  { slug: "geely-coolray-2025", name: "Geely Coolray", brand: "Geely", year: 2025, color: "Gris", transmission: "Automatique", priceDzd: 12500, priceEur: 45, photo: "/cars/geely-coolray-2025.webp", category: "SUV", seats: 5, luggage: 2, featured: true },
  { slug: "geely-coolray-2026-gris", name: "Geely Coolray", brand: "Geely", year: 2026, color: "Gris", transmission: "Manuelle", priceDzd: 11000, priceEur: 40, photo: "/cars/geely-coolray-2026-gris.webp", category: "SUV", seats: 5, luggage: 2, featured: true },
  { slug: "geely-coolray-2026-blanc", name: "Geely Coolray", brand: "Geely", year: 2026, color: "Blanc", transmission: "Manuelle", priceDzd: 9000, priceEur: 32, photo: "/cars/geely-coolray-2026-blanc.webp", category: "SUV", seats: 5, luggage: 2, featured: true },
  { slug: "fiat-tipo-2024", name: "Fiat Tipo", brand: "Fiat", year: 2024, color: "Gris", transmission: "Automatique", priceDzd: 9500, priceEur: 35, photo: "/cars/fiat-tipo-2024.webp", category: "Berline", seats: 5, luggage: 3 },
  { slug: "renault-clio-5-2022", name: "Renault Clio 5", brand: "Renault", year: 2022, color: "Argent", transmission: "Automatique", priceDzd: 12000, priceEur: 45, photo: "/cars/renault-clio-5-2022.webp", category: "Citadine", seats: 5, luggage: 2 },
  { slug: "renault-clio-5-2021", name: "Renault Clio 5", brand: "Renault", year: 2021, color: "Argent", transmission: "Manuelle", priceDzd: 9500, priceEur: 35, photo: "/cars/renault-clio-5-2021.webp", category: "Citadine", seats: 5, luggage: 2 },
  { slug: "seat-arona-2018", name: "Seat Arona", brand: "Seat", year: 2018, color: "Noir", transmission: "Manuelle", priceDzd: 9500, priceEur: 35, photo: "/cars/seat-arona-2018.webp", category: "SUV", seats: 5, luggage: 2 },
  { slug: "seat-ibiza-2018", name: "Seat Ibiza nouvelle", brand: "Seat", year: 2018, color: "Noir", transmission: "Manuelle", priceDzd: 8500, priceEur: 30, photo: "/cars/seat-ibiza-2018.webp", category: "Citadine", seats: 5, luggage: 2 },
  { slug: "seat-ibiza-toit-ouvrant-2018", name: "Seat Ibiza nouvelle", brand: "Seat", year: 2018, color: "Noir", transmission: "Manuelle", priceDzd: 9500, priceEur: 35, photo: "/cars/seat-ibiza-toit-ouvrant-2018.webp", category: "Citadine", seats: 5, luggage: 2, note: "Avec toit ouvrant" },
  { slug: "seat-ibiza-sol-2017", name: "Seat Ibiza Sol", brand: "Seat", year: 2017, color: "Blanc", transmission: "Manuelle", priceDzd: 7000, priceEur: 25, photo: "/cars/seat-ibiza-sol-2017.webp", category: "Citadine", seats: 5, luggage: 2 },
  { slug: "dacia-stepway-2017", name: "Dacia Stepway", brand: "Dacia", year: 2017, color: "Argent", transmission: "Manuelle", priceDzd: 7000, priceEur: 25, photo: "/cars/dacia-stepway-2017.webp", category: "Compacte", seats: 5, luggage: 2 },
  { slug: "renault-clio-4-2013", name: "Renault Clio 4", brand: "Renault", year: 2013, color: "Noir", transmission: "Manuelle", priceDzd: 6000, priceEur: 23, photo: "/cars/renault-clio-4-2013.webp", category: "Citadine", seats: 5, luggage: 2 },
  { slug: "audi-a3-2019", name: "Audi A3", brand: "Audi", year: 2019, color: "Gris", transmission: "Automatique", priceDzd: 25000, priceEur: 90, photo: "/cars/audi-a3-2019.webp", category: "Berline", seats: 5, luggage: 3 }
];

export const contact = {
  phoneDisplay: "+213 542 42 76 39",
  phoneDial: "+213542427639",
  whatsapp: "213542427639",
  email: "",
  tiktok: ""
};

export const conditions = [
  "Conditions de location à préciser avec le propriétaire.",
  "Livraison et restitution des véhicules à l’aéroport d’Oran 7j/7 et 24h/24.",
  "Le véhicule vous est livré propre et avec le plein d’essence, à restituer propre et avec le plein, ou des frais seront appliqués.",
  "Annulation et modification avec frais. L’annulation n’est pas gratuite.",
  "Les acomptes ne sont pas remboursables.",
  "Tarif dégressif à partir de 7 jours de location sur l’ensemble de notre gamme, en fonction de la saison et de la période.",
  "Garantie : passeport + caution (montant suivant la gamme du véhicule).",
  "Le 2ème conducteur : gratuit.",
  "Siège bébé ou siège enfant : gratuit.",
  "Assurance basique comprise dans le tarif.",
  "Durée minimum de location : 5 jours.",
  "Location des véhicules uniquement aux résidents à l’étranger."
];

export function moneyDzd(value: number) { return new Intl.NumberFormat("fr-DZ", { maximumFractionDigits: 0 }).format(value) + " DA"; }
export function moneyEur(value: number) { return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(value) + " €"; }
export function getVehicle(slug: string) { return vehicles.find((v) => v.slug === slug); }
export function rentalDays(start: string, end: string) {
  if (!start || !end) return 0;
  const from = new Date(`${start}T12:00:00`);
  const to = new Date(`${end}T12:00:00`);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return 0;
  return Math.max(0, Math.round((to.getTime() - from.getTime()) / 86400000));
}
export function waLink(message: string) { return `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(message)}`; }
