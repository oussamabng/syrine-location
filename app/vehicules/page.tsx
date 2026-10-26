import { Tr } from "@/lib/i18n";
import type { Metadata } from "next";
import { ArrowDown, MapPin, ShieldCheck } from "lucide-react";
import { VehicleFilters } from "@/components/vehicle-filters";
import { getSiteVehicles } from "@/lib/server-catalog";
import { pageMetadata } from "@/lib/seo";
export const dynamic="force-dynamic";
export function generateMetadata():Metadata{const count=getSiteVehicles().length;return pageMetadata({title:"Nos voitures de location à Oran",description:`Découvrez nos ${count} voitures à louer à Oran : SUV, citadines et berlines, boîte manuelle ou automatique. Prix par jour, livraison gratuite à l’aéroport d’Oran.`,path:"/vehicules"});}
export default function VehiclesPage(){const current=getSiteVehicles();return <><section className="inner-hero"><div className="container-wide"><span className="eyebrow"><span className="eyebrow-line"/><Tr text={" DÉCOUVRIR NOS VOITURES"}/></span><h1><Tr text={"À chaque trajet,"}/><br/><em><Tr text={"sa voiture."}/></em></h1><div className="inner-hero-bottom"><p><Tr text={"Du quotidien aux escapades, découvrez les véhicules de Syrine et choisissez votre compagnon de route."}/></p><div className="inner-hero-marker"><span>{current.length}</span><Tr text=" véhicules à découvrir"/> <ArrowDown size={17}/></div></div></div></section><section className="catalog-section container-wide section-space"><VehicleFilters initialVehicles={current}/><div className="catalog-note"><ShieldCheck size={18}/><span><Tr text={"Tarifs repris de l’ancien site, donnés à titre indicatif. La disponibilité et le devis final sont à confirmer directement avec Syrine."}/></span><MapPin size={17}/></div></section></>}
