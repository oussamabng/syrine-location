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

const benefits=[{icon:CarFront,title:"Présentation moderne",desc:"Une vitrine claire pour présenter votre sélection de véhicules."},{icon:Clock3,title:"Demande en quelques clics",desc:"Un parcours simple à adapter aux futures réservations."},{icon:ShieldCheck,title:"Suivi centralisé",desc:"Un tableau de bord conçu pour organiser les demandes et la flotte."},{icon:Plane,title:"Pensé pour Oran",desc:"Une expérience adaptée à la clientèle locale et aux visiteurs."}];
const reviews=[{excerpt:"La voiture était impeccable",context:"État et propreté du véhicule"},{excerpt:"Bon rapport qualité prix",context:"Tarifs et prestation"},{excerpt:"La location s’est déroulée sans le moindre souci",context:"Expérience de location"}];
export default function Home(){const vehicles=getSiteVehicles();const {site,cms}=getWebsiteContent();const mapsUrl=site.contact.map;const faq=site.sections.faq?cms.faq.filter(f=>!f.off&&f.q?.fr&&f.a?.fr).map(f=>({q:f.q.fr as string,a:f.a.fr as string})):[];return <>{faq.length>0&&<JsonLd data={faqJsonLd(faq)}/>}
  <section className="hero hero-fullbleed" aria-label="Chawki Auto, location de voitures à Oran">
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
        <p>{site.copy.hero_subtitle&&Object.values(site.copy.hero_subtitle).some(Boolean)?<SiteCopy value={site.copy.hero_subtitle} fallback="Une nouvelle expérience pour découvrir une agence de location de voitures à Oran. Maquette indépendante, proposée à Chawki Auto."/>:<><Tr text="Une expérience automobile " /><strong><Tr text="moderne" /></strong><Tr text=" et pensée pour Oran. Un concept de site élégant, rapide et clair." /></>}</p>
        <div className="hero-actions">
          <Link className="button button-primary" href="/vehicules"><Tr text="Explorer nos véhicules "/><ArrowUpRight size={19}/></Link>
          <a href={`tel:${site.contact.phone}`} className="button button-hero-outline"><Tr text="Parler à notre équipe "/><ArrowRight size={18}/></a>
        </div>
        <div className="hero-proof">
          <div className="review-stars" aria-hidden="true">✦</div>
          <span><strong>Refonte proposée</strong><small>Site vitrine + espace de gestion</small></span>
          <span className="hero-proof-sep"/>
          <div><strong><Tr text="Oran · Algérie"/></strong><small><Tr text="Votre agence locale"/></small></div>
        </div>
      </div>
      <div className="hero-airport-note">
        <span className="hero-airport-note-icon"><Plane size={21}/></span>
        <span><strong><Tr text="Vous atterrissez à Oran ?"/></strong><small><Tr text="Explorez une expérience de réservation repensée."/></small></span>
      </div>
      <small className="hero-art-caption"><Tr text="Visuel d’illustration"/></small>
    </div>
  </section>
  <section className="search-section" id="recherche" aria-label="Rechercher un véhicule"><div className="container-wide floating-search"><DateSearch/></div></section>
  <section style={{display:site.sections.features?undefined:"none"}} className="benefits-section section-space container-wide"><Reveal><SectionHeading eyebrow="L'EXPÉRIENCE CHAWKI" title={<><Tr text="Bien plus qu'une "/><span className="accent"><Tr text={"location."}/></span></>} description="La liberté de découvrir Oran, avec une équipe à vos côtés du début à la fin."/></Reveal><div className="benefits-grid">{benefits.map((b,i)=><Reveal key={b.title} delay={i*65}><div className="benefit-card"><span className="benefit-icon"><b.icon size={25} strokeWidth={1.65}/></span><h3><Tr text={b.title}/></h3><p><Tr text={b.desc}/></p><div className="benefit-index">0{i+1}</div></div></Reveal>)}</div></section>
  <section style={{display:site.sections.fleet?undefined:"none"}} className="fleet-section section-space"><div className="container-wide"><Reveal><SectionHeading eyebrow="NOTRE FLOTTE" title={<><Tr text="Trouvez la voiture "/><span className="accent"><Tr text={"idéale."}/></span></>} description="Véhicules et tarifs d’illustration : la flotte réelle et les prix seront définis avec le propriétaire." link="/vehicules" linkLabel="Voir toute la flotte"/></Reveal><div className="featured-grid">{vehicles.filter(v=>v.featured).map((v,i)=><Reveal key={v.slug} delay={i*85}><VehicleCard vehicle={v} index={i}/></Reveal>)}</div><div className="center-cta"><Link href="/vehicules" className="button button-outline"><Tr text={"Découvrir les véhicules "}/><ArrowRight size={18}/></Link></div></div></section>
  <section style={{display:site.sections.steps?undefined:"none"}} className="steps-section section-space container-wide"><Reveal><SectionHeading eyebrow="COMMENT ÇA MARCHE ?" title={<><Tr text="Simple comme "/><span className="accent"><Tr text={"bonjour."}/></span></>} description="Trois étapes pour préparer votre location et prendre la route."/></Reveal><div className="steps-grid"><Reveal><div className="step-card"><span className="step-number">01</span><CarFront size={31}/><h3><Tr text={"Choisissez"}/></h3><p><Tr text={"Explorez notre flotte et trouvez le modèle qui correspond à vos besoins."}/></p></div></Reveal><Reveal delay={65}><div className="step-card"><span className="step-number">02</span><Gauge size={31}/><h3><Tr text={"Préparez votre demande"}/></h3><p><Tr text={"Découvrez le parcours de demande, actuellement désactivé en mode démonstration."}/></p></div></Reveal><Reveal delay={130}><div className="step-card"><span className="step-number">03</span><MapPin size={31}/><h3><Tr text={"Prenez la route"}/></h3><p><Tr text={"La remise du véhicule et les modalités seraient définies avec le propriétaire."}/></p></div></Reveal></div></section>
  <section style={{display:site.sections.story?undefined:"none"}} className="story-section section-space"><div className="container-wide story-layout"><Reveal><div className="story-copy"><span className="eyebrow"><span className="eyebrow-line"/><Tr text={" UNE AGENCE, UNE PASSION"}/></span><h2><Tr text={"L'accueil d'ici."}/><br/><span className="accent"><Tr text={"L'esprit libre."}/></span></h2><p><Tr text={"Un concept de vitrine moderne pour Chawki Auto Oran : une navigation fluide, des véhicules valorisés et une gestion simplifiée."}/></p><div className="story-stat-row"><div><strong>01</strong><span>Vitrine moderne</span></div><div><strong>13</strong><span>Exemples illustratifs</span></div><div><strong>CRM</strong><span>Gestion intégrée</span></div></div><a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="text-link"><Tr text={"Nous trouver sur Google Maps "}/><ArrowUpRight size={18}/></a></div></Reveal><Reveal delay={70}><div className="story-photo-shell"><GarageImage/><div className="story-photo-overlay"><MapPinned size={17}/><span><Tr text={"Emplacement Google Maps · Oran"}/></span><ArrowUpRight size={16}/></div></div></Reveal></div></section>
  {site.sections.reviews&&cms.tes.filter(t=>!t.off).length>0&&<section className="section-space container-wide"><h2 className="section-heading">Témoignages publiés par l'agence</h2><div className="reviews-grid">{cms.tes.filter(t=>!t.off).map(t=><article className="review-card" key={t.id}><span className="review-stars">{'★'.repeat(t.r)}</span><blockquote><CmsText value={t.t}/></blockquote><strong>{t.n}</strong></article>)}</div></section>}
  {site.sections.faq&&cms.faq.some(f=>!f.off)&&<section className="section-space container-wide"><h2>Questions fréquentes</h2>{cms.faq.filter(f=>!f.off).map(f=><details className="faq-item" key={f.id}><summary><CmsText value={f.q}/></summary><p><CmsText value={f.a}/></p></details>)}</section>}
  <section style={{display:site.sections.cta?undefined:"none"}} className="cta-section section-space"><div className="container-wide"><Reveal><div className="cta-panel"><div className="cta-orbit cta-orbit-one"/><div className="cta-orbit cta-orbit-two"/><div className="cta-content"><span className="eyebrow"><span className="eyebrow-line"/><Tr text={" PRÊT POUR ORAN ?"}/></span><h2><Tr text={"La route vous attend."}/><br/><span><Tr text={"On s'occupe du reste."}/></span></h2><p><Tr text={"Cette maquette illustre une future expérience clients et peut être personnalisée selon les besoins de l’agence."}/></p><ContactBar/></div><div className="cta-mark" aria-hidden="true">C<span>.</span></div></div></Reveal></div></section>
 </>}

