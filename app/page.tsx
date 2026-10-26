import { Tr } from "@/lib/i18n";
import {CmsText,SiteCopy} from "@/components/site-copy";
import {getWebsiteContent} from "@/lib/site-content";
import { BlurImage } from "@/components/blur-image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Clock3, MapPin, Plane, ShieldCheck, CarFront, Headphones, Star, MoveUpRight, Quote, Check, MapPinned, Sparkles, Gauge } from "lucide-react";
import { DateSearch } from "@/components/date-search";
import { SectionHeading } from "@/components/section-heading";
import { VehicleCard } from "@/components/vehicle-card";
import { Reveal } from "@/components/reveal";
import { GarageImage } from "@/components/garage-image";
import { ContactBar } from "@/components/contact-bar";
import { contact } from "@/lib/data";
import { getSiteVehicles } from "@/lib/server-catalog";
import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { faqJsonLd } from "@/lib/seo";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { alternates: { canonical: "/" } };

const benefits=[{icon:Clock3,title:"À votre écoute 24h/24",desc:"Une équipe joignable pour vous accompagner tout au long de votre location."},{icon:Plane,title:"Livraison aéroport gratuite",desc:"Récupérez votre véhicule dès votre arrivée à Oran Es-Sénia."},{icon:ShieldCheck,title:"L’esprit tranquille",desc:"Des véhicules préparés avec soin et une assurance basique incluse."},{icon:CarFront,title:"Pour chaque voyage",desc:"Citadines, berlines et SUV : trouvez celui qui vous correspond."}];
const reviews=[{excerpt:"La voiture était impeccable",context:"État et propreté du véhicule"},{excerpt:"Bon rapport qualité prix",context:"Tarifs et prestation"},{excerpt:"La location s’est déroulée sans le moindre souci",context:"Expérience de location"}];
export default function Home(){const vehicles=getSiteVehicles();const {site,cms}=getWebsiteContent();const mapsUrl=site.contact.map;const faq=site.sections.faq?cms.faq.filter(f=>!f.off&&f.q?.fr&&f.a?.fr).map(f=>({q:f.q.fr as string,a:f.a.fr as string})):[];return <>{faq.length>0&&<JsonLd data={faqJsonLd(faq)}/>}
  <section className="hero hero-fullbleed" aria-label="Syrine, location de voitures à Oran">
    <div className="hero-backdrop" aria-hidden="true">
      <BlurImage
        src="/hero/airport-arrival.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="hero-backdrop-image hero-backdrop-night"
      />
      <BlurImage
        src="/hero/airport-morning.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="hero-backdrop-image hero-backdrop-day"
      />
      <div className="hero-tone hero-tone-night" />
      <div className="hero-tone hero-tone-day" />
    </div>
    <div className="container-wide hero-layout">
      <div className="hero-copy">
        <div className="hero-overline"><span className="live-dot"/><Tr text=" LOCATION DE VOITURES À ORAN, ALGÉRIE"/></div>
        <h1>{site.copy.hero_title&&Object.values(site.copy.hero_title).some(Boolean)?<SiteCopy value={site.copy.hero_title} fallback="Votre voyage, notre signature."/>:<><Tr text="Votre voyage,"/><br/><Tr text="notre "/> <em><Tr text="signature."/></em></>}</h1>
        <p>{site.copy.hero_subtitle&&Object.values(site.copy.hero_subtitle).some(Boolean)?<SiteCopy value={site.copy.hero_subtitle} fallback="Un service disponible 24h/24 et la livraison gratuite à l’aéroport d’Oran. Voyagez avec élégance, en toute sérénité."/>:<><Tr text="Un service disponible "/><strong><Tr text="24h/24"/></strong><Tr text=" et la livraison "/><strong><Tr text="gratuite à l’aéroport d’Oran."/></strong><Tr text=" Voyagez avec élégance, en toute sérénité."/></>}</p>
        <div className="hero-actions">
          <Link className="button button-primary" href="/vehicules"><Tr text="Explorer nos véhicules "/><ArrowUpRight size={19}/></Link>
          <a href={`tel:${site.contact.phone}`} className="button button-hero-outline"><Tr text="Parler à notre équipe "/><ArrowRight size={18}/></a>
        </div>
        <div className="hero-proof">
          <div className="review-stars" aria-label="Google reviews">★★★★☆</div>
          <span><strong><Tr text="4,2/5 sur Google"/></strong><small><Tr text="30 avis clients · voir les avis plus bas"/></small></span>
          <span className="hero-proof-sep"/>
          <div><strong><Tr text="Oran · Bir El Djir"/></strong><small><Tr text="Votre agence locale"/></small></div>
        </div>
      </div>
      <div className="hero-airport-note">
        <span className="hero-airport-note-icon"><Plane size={21}/></span>
        <span><strong><Tr text="Vous atterrissez à Oran ?"/></strong><small><Tr text="On vous livre votre voiture gratuitement."/></small></span>
      </div>
      <small className="hero-art-caption"><Tr text="Visuel d’illustration"/></small>
    </div>
  </section>
  <section className="search-section" id="recherche" aria-label="Rechercher un véhicule"><div className="container-wide floating-search"><DateSearch/></div></section>
  <section style={{display:site.sections.features?undefined:"none"}} className="benefits-section section-space container-wide"><Reveal><SectionHeading eyebrow="L'EXPÉRIENCE SYRINE" title={<><Tr text="Bien plus qu'une "/><span className="accent"><Tr text={"location."}/></span></>} description="La liberté de découvrir Oran, avec une équipe à vos côtés du début à la fin."/></Reveal><div className="benefits-grid">{benefits.map((b,i)=><Reveal key={b.title} delay={i*65}><div className="benefit-card"><span className="benefit-icon"><b.icon size={25} strokeWidth={1.65}/></span><h3><Tr text={b.title}/></h3><p><Tr text={b.desc}/></p><div className="benefit-index">0{i+1}</div></div></Reveal>)}</div></section>
  <section style={{display:site.sections.fleet?undefined:"none"}} className="fleet-section section-space"><div className="container-wide"><Reveal><SectionHeading eyebrow="NOTRE FLOTTE" title={<><Tr text="Trouvez la voiture "/><span className="accent"><Tr text={"idéale."}/></span></>} description="Une sélection de véhicules pour vos séjours, vos vacances et vos déplacements à Oran." link="/vehicules" linkLabel="Voir toute la flotte"/></Reveal><div className="featured-grid">{vehicles.filter(v=>v.featured).map((v,i)=><Reveal key={v.slug} delay={i*85}><VehicleCard vehicle={v} index={i}/></Reveal>)}</div><div className="center-cta"><Link href="/vehicules" className="button button-outline"><Tr text={"Découvrir les véhicules "}/><ArrowRight size={18}/></Link></div></div></section>
  <section style={{display:site.sections.airport?undefined:"none"}} className="airport-section section-space"><div className="container-wide airport-layout"><Reveal><div className="airport-visual"><div className="airport-photo"><BlurImage src="/cars/fiat-tipo-2024.webp" alt="Fiat Tipo de la flotte de location Syrine à Oran" fill sizes="(max-width: 850px) 95vw, 45vw"/></div><div className="airport-location-badge"><span><Plane size={19}/></span><div><strong><Tr text={"Aéroport d'Oran"}/></strong><small><Tr text={"Ahmed Ben Bella · Livraison offerte"}/></small></div></div><span className="airport-visual-deco">ORAN <em>•</em> DZ</span></div></Reveal><Reveal delay={80}><div className="airport-copy"><span className="eyebrow"><span className="eyebrow-line"/><Tr text={" VOTRE ARRIVÉE, SIMPLIFIÉE"}/></span><h2><Tr text="De l'avion au volant, "/><span className="accent"><Tr text={"sans détour."}/></span></h2><p><SiteCopy value={site.copy.airport_title} fallback="À peine arrivé à Oran, votre aventure commence. Nous organisons la remise de votre voiture directement à l’aéroport, sans frais de livraison."/></p><div className="airport-facts"><div><Check size={19}/><Tr text={" Livraison gratuite à l'aéroport"}/></div><div><Check size={19}/><Tr text={" Service et assistance 24h/24"}/></div><div><Check size={19}/><Tr text={" Deuxième conducteur offert"}/></div></div><Link href="/contact" className="button button-primary"><Tr text={"Organiser mon arrivée "}/><ArrowUpRight size={18}/></Link></div></Reveal></div></section>
  <section style={{display:site.sections.steps?undefined:"none"}} className="steps-section section-space container-wide"><Reveal><SectionHeading eyebrow="COMMENT ÇA MARCHE ?" title={<><Tr text="Simple comme "/><span className="accent"><Tr text={"bonjour."}/></span></>} description="Trois étapes pour préparer votre location et prendre la route."/></Reveal><div className="steps-grid"><Reveal><div className="step-card"><span className="step-number">01</span><CarFront size={31}/><h3><Tr text={"Choisissez"}/></h3><p><Tr text={"Explorez notre flotte et trouvez le modèle qui correspond à vos besoins."}/></p></div></Reveal><Reveal delay={65}><div className="step-card"><span className="step-number">02</span><Gauge size={31}/><h3><Tr text={"Préparez votre demande"}/></h3><p><Tr text={"Indiquez vos dates et coordonnées. Nous confirmerons ensemble les détails."}/></p></div></Reveal><Reveal delay={130}><div className="step-card"><span className="step-number">03</span><MapPin size={31}/><h3><Tr text={"Prenez la route"}/></h3><p><Tr text={"Récupérez votre véhicule en agence ou directement à l’aéroport d’Oran."}/></p></div></Reveal></div></section>
  <section style={{display:site.sections.story?undefined:"none"}} className="story-section section-space"><div className="container-wide story-layout"><Reveal><div className="story-copy"><span className="eyebrow"><span className="eyebrow-line"/><Tr text={" UNE AGENCE, UNE PASSION"}/></span><h2><Tr text={"L'accueil d'ici."}/><br/><span className="accent"><Tr text={"L'esprit libre."}/></span></h2><p><Tr text={"Basée à Bir El Djir, notre agence vous accueille à Oran et vous accompagne dans le choix de votre véhicule. Une relation simple, humaine et à votre écoute."}/></p><div className="story-stat-row"><div><strong>24/7</strong><span><Tr text={"Assistance"}/></span></div><div><strong>13</strong><span><Tr text={"Véhicules présentés"}/></span></div><div><strong>0 DA</strong><span><Tr text={"Livraison aéroport"}/></span></div></div><a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="text-link"><Tr text={"Nous trouver sur Google Maps "}/><ArrowUpRight size={18}/></a></div></Reveal><Reveal delay={70}><div className="story-photo-shell"><GarageImage/><div className="story-photo-overlay"><MapPinned size={17}/><span><Tr text={"Notre agence · Bir El Djir, Oran"}/></span><ArrowUpRight size={16}/></div></div></Reveal></div></section>
  <section style={{display:site.sections.reviews?undefined:"none"}} className="reviews-section section-space container-wide"><Reveal><SectionHeading eyebrow="LA PAROLE À NOS CLIENTS" title={<><Tr text="Leur confiance, notre "/><span className="accent"><Tr text={"plus belle route."}/></span></>} description="Extraits courts des avis Google de l'agence Syrine. Les auteurs ne sont pas affichés ici."/></Reveal><Reveal><div className="reviews-banner"><span className="reviews-google">G<span>o</span>o<span>g</span>le</span><strong><Tr text="4,2"/><span>/5</span></strong><span className="review-stars">★★★★☆</span><span className="muted"><Tr text={"30 avis lors de la consultation"}/></span><a href={mapsUrl} target="_blank" rel="noopener noreferrer"><Tr text={"Consulter les avis "}/><ArrowUpRight size={15}/></a></div></Reveal><div className="reviews-grid">{reviews.map((r,i)=><Reveal key={i} delay={i*70}><div className="review-card"><Quote size={25}/><div className="review-source-pill"><Tr text={"AVIS GOOGLE"}/></div><blockquote>« <Tr text={r.excerpt}/> »</blockquote><span className="review-caption"><Tr text={"Extrait d'avis Google"}/></span><small><Tr text={r.context}/></small></div></Reveal>)}</div><p className="review-disclaimer"><Tr text={"Les extraits sont issus des avis publics présentés pour l'établissement. Consultez Google Maps pour les commentaires complets et la note actualisée."}/></p></section>
  {site.sections.reviews&&cms.tes.filter(t=>!t.off).length>0&&<section className="section-space container-wide"><h2 className="section-heading">Témoignages publiés par l'agence</h2><div className="reviews-grid">{cms.tes.filter(t=>!t.off).map(t=><article className="review-card" key={t.id}><span className="review-stars">{'★'.repeat(t.r)}</span><blockquote><CmsText value={t.t}/></blockquote><strong>{t.n}</strong></article>)}</div></section>}
  {site.sections.faq&&cms.faq.some(f=>!f.off)&&<section className="section-space container-wide"><h2>Questions fréquentes</h2>{cms.faq.filter(f=>!f.off).map(f=><details className="faq-item" key={f.id}><summary><CmsText value={f.q}/></summary><p><CmsText value={f.a}/></p></details>)}</section>}
  <section style={{display:site.sections.cta?undefined:"none"}} className="cta-section section-space"><div className="container-wide"><Reveal><div className="cta-panel"><div className="cta-orbit cta-orbit-one"/><div className="cta-orbit cta-orbit-two"/><div className="cta-content"><span className="eyebrow"><span className="eyebrow-line"/><Tr text={" PRÊT POUR ORAN ?"}/></span><h2><Tr text={"La route vous attend."}/><br/><span><Tr text={"On s'occupe du reste."}/></span></h2><p><Tr text={"Des questions, des dates à confirmer, une arrivée à l'aéroport ? Notre équipe est à votre écoute."}/></p><ContactBar/></div><div className="cta-mark" aria-hidden="true">S<span>.</span></div></div></Reveal></div></section>
 </>}
