import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight, CalendarDays, CarFront, CheckCircle2, Clock3, Info,
  MapPin, MessageCircle, Phone, Route, ShieldCheck,
} from "lucide-react";
import { pageMetadata } from "@/lib/seo";
import { getWebsiteContent } from "@/lib/site-content";
import { Tr } from "@/lib/i18n";
import { WhatsAppContactCard } from "@/components/whatsapp-contact-card";
import { ContactWhatsAppLink } from "@/components/contact-whatsapp-link";
import { GarageImage } from "@/components/garage-image";

export const metadata: Metadata = pageMetadata({
  title: "Contact – Chawki Auto Oran",
  description: "Coordonnées publiques, téléphone et localisation de Chawki Auto à Oran. Proposition indépendante de refonte du site.",
  path: "/contact",
});

const requestInfo = [
  {icon: CalendarDays, title: "Vos dates", detail: "Départ, retour et durée souhaitée"},
  {icon: CarFront, title: "Votre véhicule", detail: "Modèle ou catégorie recherchée"},
  {icon: Route, title: "Votre trajet", detail: "Lieu de récupération souhaité"},
];

export default function ContactPage() {
  const {site} = getWebsiteContent();
  const mapsUrl = site.contact.map;
  return <>
    <section className="inner-hero">
      <div className="container-wide">
        <span className="eyebrow"><span className="eyebrow-line"/><Tr text=" À VOTRE ÉCOUTE"/></span>
        <h1><Tr text="Parlons de votre"/><br/><em><Tr text="prochain trajet."/></em></h1>
        <div className="inner-hero-bottom">
          <p>Une question sur un véhicule, une disponibilité ou les conditions de location ? Retrouvez ici les coordonnées publiques de l'agence à Oran.</p>
          <span className="document-update"><Clock3 size={16}/> Contact direct</span>
        </div>
      </div>
    </section>

    <section className="section-space container-wide contact-page-content info-contact-page">
      <div className="contact-cards info-contact-cards">
        <a href={`tel:${site.contact.phone}`} className="contact-info-card">
          <span><Phone size={24}/></span><small>PAR TÉLÉPHONE</small><strong>{site.contact.phone}</strong><span className="contact-arrow"><ArrowUpRight size={19}/></span>
        </a>
        <WhatsAppContactCard/>
        <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="contact-info-card">
          <span><MapPin size={24}/></span><small>NOUS TROUVER</small><strong>Oran, Algérie</strong><span className="contact-arrow"><ArrowUpRight size={19}/></span>
        </a>
      </div>

      <div className="contact-content-grid">
        <div className="contact-message-card info-contact-lead">
          <span className="eyebrow"><span className="eyebrow-line"/> VOTRE DEMANDE</span>
          <h2>Un projet de location ? <span className="accent">Parlons-en.</span></h2>
          <p>Pour faciliter les échanges avec l'agence, voici les trois informations à préparer avant de la contacter.</p>
          <div className="info-request-items">
            {requestInfo.map((item,i)=><div className="info-request-row" key={item.title}>
              <span className="info-request-icon"><item.icon size={22}/></span>
              <div><small>ÉTAPE 0{i+1}</small><h3>{item.title}</h3><p>{item.detail}</p></div>
              <CheckCircle2 className="info-request-check" size={19}/>
            </div>)}
          </div>
          <div className="info-contact-buttons">
            <ContactWhatsAppLink/>
            <a className="button button-outline" href={`tel:${site.contact.phone}`}><Phone size={18}/> Appeler</a>
          </div>
          <p className="info-contact-footnote"><Info size={15}/> Aucun formulaire ne recueille de données sur cette maquette indépendante. Les coordonnées ci-dessus sont issues de la fiche publique de l'agence.</p>
        </div>

        <div className="contact-side">
          <div className="contact-location">
            <div className="contact-location-photo">{site.contact.mapEmbed
              ? <iframe title="Localisation Chawki Auto" src={site.contact.mapEmbed} loading="lazy" referrerPolicy="no-referrer-when-downgrade" style={{width:"100%",height:"100%",minHeight:230,border:0}}/>
              : <GarageImage/>}</div>
            <div className="contact-location-info">
              <span className="eyebrow"><span className="eyebrow-line"/> LOCALISATION</span>
              <h3>Retrouvez l'agence <span className="accent">à Oran.</span></h3>
              <p><MapPin size={17}/> PCHV+5QG, Oran, Algérie</p>
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="button button-outline">Voir l'itinéraire <ArrowUpRight size={17}/></a>
            </div>
          </div>
          <div className="contact-promise">
            <h3>Quelques conseils pratiques</h3>
            <div><CalendarDays size={19}/><span>Précisez vos dates pour demander une disponibilité.</span></div>
            <div><MessageCircle size={19}/><span>Décrivez votre besoin pour obtenir une réponse adaptée.</span></div>
            <div><ShieldCheck size={19}/><span>Confirmez les conditions et les tarifs avant tout engagement.</span></div>
          </div>
        </div>
      </div>

      <div className="info-contact-help">
        <div><span className="eyebrow">BESOIN D'EN SAVOIR PLUS ?</span><h2>Préparez votre location en toute sérénité.</h2><p>Documents, caution, assurance et restitution : notre guide vous aide à poser les bonnes questions.</p></div>
        <Link href="/conditions" className="button button-outline">Consulter le guide <ArrowUpRight size={18}/></Link>
      </div>
      <p className="info-contact-disclosure"><Info size={17}/> Site de démonstration non officiel. Les services, tarifs, horaires et modalités réels sont à confirmer directement auprès de Chawki Auto.</p>
    </section>
  </>;
}
