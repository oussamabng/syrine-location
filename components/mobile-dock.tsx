"use client";
import {useWhatsAppNumber,whatsappUrl} from "@/lib/use-public-contact";
import { Tr } from "@/lib/i18n";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CarFront, MessageCircle } from "lucide-react";
import { waLink } from "@/lib/data";
import { useLocale } from "@/lib/i18n";
export function MobileDock(){const {t,locale}=useLocale();const whatsappNumber=useWhatsAppNumber();const path=usePathname();return <nav className="mobile-dock" aria-label={t("Accès rapides")}><Link href="/vehicules" className={`mobile-dock-fleet ${path.startsWith('/vehicules')?'is-current':''}`}><CarFront size={19}/><Tr text={" Voir les véhicules"}/></Link><a href={whatsappUrl(whatsappNumber,locale === "ar" ? "مرحباً سيرين، أريد الاستفسار عن تأجير سيارة في وهران." : locale === "en" ? "Hello Syrine, I would like to ask about renting a car in Oran." : "Bonjour Syrine, je souhaite obtenir des informations pour louer une voiture à Oran.")} target="_blank" rel="noopener noreferrer" className="mobile-dock-whatsapp"><MessageCircle size={19}/> WhatsApp</a></nav>}
