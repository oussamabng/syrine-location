import { Tr } from "@/lib/i18n";
import type { Metadata } from "next";
import { ArrowDown, MapPin, ShieldCheck } from "lucide-react";
import { VehicleFilters } from "@/components/vehicle-filters";
import { getSiteVehicles } from "@/lib/server-catalog";
import { pageMetadata } from "@/lib/seo";
export const dynamic="force-dynamic";
export function generateMetadata():Metadata{const count=getSiteVehicles().length;return pageMetadata({title:"Nos voitures de location à Oran",description:`Découvrez nos ${count} voitures à louer à Oran : SUV, citadines et berlines, boîte manuelle ou automatique. Tarifs illustratifs uniquement, réservations désactivées.`,path:"/vehicules"});}
export default function VehiclesPage(){const current=getSiteVehicles();return <><section className="inner-hero"><div className="container-wide"><span className="eyebrow"><span className="eyebrow-line"/><Tr text={" DÉCOUVRIR NOS VOITURES"}/></span><h1><Tr text={"À chaque trajet,"}/><br/><em><Tr text={"sa voiture."}/></em></h1><div className="inner-hero-bottom"><p><Tr text={"Découvrez un exemple d’affichage de flotte. Aucune voiture ni tarif n’est confirmé par Chawki Auto."}/></p><div className="inner-hero-marker"><span>{current.length}</span><Tr text=" véhicules à découvrir"/> <ArrowDown size={17}/></div></div></div></section><section className="catalog-section container-wide section-space"><VehicleFilters initialVehicles={current}/><div className="catalog-note"><ShieldCheck size={18}/><span><Tr text={"Flotte et tarifs fictifs provenant de la maquette, sans lien avec les véhicules ou tarifs réels de Chawki Auto."}/></span><MapPin size={17}/></div></section></>}
