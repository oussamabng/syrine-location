import { Tr } from "@/lib/i18n";
import { ArrowUpRight, MessageCircle, Phone } from "lucide-react";
import { contact, waLink } from "@/lib/data";
import {getWebsiteContent} from "@/lib/site-content";
import { ContactWhatsAppLink } from "@/components/contact-whatsapp-link";
export function ContactBar({ compact=false }:{compact?:boolean}) {const {site}=getWebsiteContent();return <div className={`contact-actions ${compact?"compact":""}`}><ContactWhatsAppLink/><a className="button button-outline" href={`tel:${site.contact.phone}`}><Phone size={17}/><Tr text={" Nous appeler"}/></a></div>; }
