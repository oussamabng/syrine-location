import { Tr } from "@/lib/i18n";
import Link from "next/link";
import { ArrowUpRight, Instagram, MapPin, Phone, Mail } from "lucide-react";
import { Brand } from "@/components/brand";
import { contact } from "@/lib/data";
import {getWebsiteContent} from "@/lib/site-content";
import {SiteCopy} from "@/components/site-copy";
export function Footer() {
 const {site}=getWebsiteContent();
 return <footer className="site-footer"><div className="container-wide">
  <div className="footer-top"><div><Brand inverted/><p><SiteCopy value={site.copy.footer_tagline} fallback="Votre route commence ici. Location de voitures à Oran, avec un service à votre écoute, jour et nuit."/></p></div>
    <div className="footer-links"><h4><Tr text={"Explorer"}/></h4><Link href="/"><Tr text={"Accueil"}/></Link><Link href="/vehicules"><Tr text={"Nos véhicules"}/></Link><Link href="/conditions"><Tr text={"Conditions de location"}/></Link><Link href="/contact"><Tr text={"Nous contacter"}/></Link></div>
    <div className="footer-links"><h4><Tr text={"Restons en contact"}/></h4><a href={`tel:${site.contact.phone}`}><Phone size={15}/> {site.contact.phone}</a><a href={`mailto:${site.contact.email}`}><Mail size={15}/><Tr text={" Écrivez-nous"}/></a><span><MapPin size={15}/><Tr text={" Oran, Algérie"}/></span></div>
  </div>
  <div className="footer-bottom"><span>© {new Date().getFullYear()} {site.contact.copyright}. <Tr text="Tous droits réservés."/></span><span><Tr text={"Conçu pour vos trajets à Oran "}/><ArrowUpRight size={14}/></span></div>
 </div></footer>;
}
