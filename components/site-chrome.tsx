"use client";
import { usePathname } from "next/navigation";
import { Header } from "@/components/header";
import { MobileDock } from "@/components/mobile-dock";
/** Prospect concept demo — never imply affiliation with the real agency. */
export function SiteChrome({children,footer}:{children:React.ReactNode;footer:React.ReactNode}) {
 const isAdmin=usePathname().startsWith('/admin');
 if(isAdmin)return <main id="contenu" className="admin-main"><div className="demo-banner">CRM DE DÉMONSTRATION INDÉPENDANT · Données et véhicules fictifs</div>{children}</main>;
 return <><div className="demo-banner">PROPOSITION DE REFONTE NON OFFICIELLE · Véhicules et tarifs illustratifs · Aucune réservation en ligne</div><Header/><main id="contenu">{children}</main>{footer}<MobileDock/></>;
}
