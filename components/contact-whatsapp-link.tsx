"use client";
import {useWhatsAppNumber,whatsappUrl} from "@/lib/use-public-contact";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import { waLink } from "@/lib/data";
import { useLocale } from "@/lib/i18n";
export function ContactWhatsAppLink(){
 const {t,locale}=useLocale();const whatsappNumber=useWhatsAppNumber();
 const message=locale==="ar"?"مرحباً سيرين، أريد الاستفسار عن تأجير سيارة في وهران.":locale==="en"?"Hello Chawki Auto, I'd like information about renting a car in Oran.":"Bonjour Chawki Auto, je souhaite me renseigner sur la location d'un véhicule à Oran.";
 return <a className="button button-primary" href={whatsappUrl(whatsappNumber,message)} target="_blank" rel="noopener noreferrer"><MessageCircle size={17}/>{t("Discuter sur WhatsApp")}<ArrowUpRight size={17}/></a>;
}
