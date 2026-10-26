"use client";
import { Tr, useLocale } from "@/lib/i18n";
import Link from "next/link";
import { BlurImage } from "@/components/blur-image";
import { ArrowUpRight, Gauge, Users } from "lucide-react";
import { Vehicle, moneyDzd, moneyEur } from "@/lib/data";
export function VehicleCard({ vehicle, index = 0 }: { vehicle: Vehicle; index?: number }) {
 const {t}=useLocale();
 return <article className="vehicle-card" style={{ animationDelay: `${Math.min(index, 8) * 65}ms` }}>
   <Link href={`/vehicules/${vehicle.slug}`} className="vehicle-media" aria-label={`${t("Découvrir")} ${vehicle.name} ${vehicle.year}`}>
     <BlurImage src={vehicle.photo} alt={`${vehicle.name} ${vehicle.year} ${t(vehicle.color)}`} fill sizes="(max-width: 650px) 92vw, (max-width: 1050px) 45vw, 30vw" className="vehicle-photo" />
     <span className="vehicle-image-label"><Tr text={vehicle.category}/></span><span className="vehicle-image-arrow"><ArrowUpRight size={20}/></span>
   </Link>
   <div className="vehicle-card-content"><div className="vehicle-heading"><div><p className="vehicle-meta">{vehicle.brand} <span>·</span> {vehicle.year}</p><h3>{vehicle.name}</h3></div></div>
     {vehicle.note && <span className="special-note"><Tr text={vehicle.note}/></span>}
     <div className="vehicle-specs"><span><Gauge size={15}/><Tr text={vehicle.transmission}/></span><span><Users size={15}/>{vehicle.seats} <Tr text="places"/></span><span className="spec-dot"><Tr text={vehicle.color}/></span></div>
     <div className="vehicle-card-bottom"><div className="vehicle-price"><strong>{moneyDzd(vehicle.priceDzd)}</strong><span><Tr text={"/ jour "}/><i>·</i> {moneyEur(vehicle.priceEur)}</span></div><Link className="round-action" href={`/vehicules/${vehicle.slug}`} aria-label={`${t("Voir")} ${vehicle.name}`}><ArrowUpRight size={21}/></Link></div>
   </div>
 </article>;
}
