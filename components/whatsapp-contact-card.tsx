"use client";
import {useWhatsAppNumber,whatsappUrl} from "@/lib/use-public-contact";
import { MessageCircle, ArrowUpRight } from "lucide-react";
import { waLink } from "@/lib/data";
import { useLocale } from "@/lib/i18n";
export function WhatsAppContactCard(){
 const {t,locale}=useLocale();const whatsappNumber=useWhatsAppNumber();
 const message=locale==="ar"?"مرحباً، أريد معلومات عن تأجير السيارات في وهران.":locale==="en"?"Hello, I would like more information about your rentals in Oran.":"Bonjour, je souhaite obtenir des informations sur vos locations à Oran.";
 return <a target="_blank" rel="noopener noreferrer" href={whatsappUrl(whatsappNumber,message)} className="contact-info-card"><span><MessageCircle size={24}/></span><small>{t("SUR WHATSAPP")}</small><strong>{t("Discutons ensemble")}</strong><span className="contact-arrow"><ArrowUpRight size={19}/></span></a>;
}
