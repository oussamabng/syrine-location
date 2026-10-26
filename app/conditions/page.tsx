import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight, BadgeCheck, CalendarDays, CarFront, Check, ClipboardList,
  CreditCard, FileCheck2, HelpCircle, Info, PhoneCall, ShieldCheck,
} from "lucide-react";
import { getWebsiteContent } from "@/lib/site-content";
import { Tr } from "@/lib/i18n";
import { ContactWhatsAppLink } from "@/components/contact-whatsapp-link";

export const metadata: Metadata = {
  title: "Conditions de location – Informations pratiques | Chawki Auto Oran",
  description: "Guide pratique pour préparer une demande de location de voiture à Oran. Informations illustratives, à confirmer directement avec l'agence.",
  robots: { index: false, follow: false },
};

const steps = [
  {
    number: "01", icon: CalendarDays, title: "Choisir vos dates",
    subtitle: "Avant de demander un véhicule",
    items: [
      "Indiquez vos dates de départ et de retour souhaitées.",
      "Précisez le modèle ou la catégorie de véhicule qui vous intéresse.",
      "Demandez une confirmation de disponibilité avant de vous déplacer.",
    ],
  },
  {
    number: "02", icon: FileCheck2, title: "Préparer vos documents",
    subtitle: "Pour faciliter les échanges",
    items: [
      "Prévoyez une pièce d'identité et un permis de conduire en cours de validité.",
      "Vérifiez directement avec l'agence les critères d'âge et d'ancienneté du permis.",
      "Les éventuelles pièces complémentaires seront précisées par l'agence.",
    ],
  },
  {
    number: "03", icon: CreditCard, title: "Comprendre le devis",
    subtitle: "Un prix clair avant tout engagement",
    items: [
      "Demandez le tarif correspondant aux dates et au véhicule choisi.",
      "Faites préciser, si applicables, le dépôt de garantie, le kilométrage et les frais supplémentaires.",
      "Confirmez les moyens de paiement acceptés et les modalités d'annulation.",
    ],
  },
  {
    number: "04", icon: CarFront, title: "Récupérer et rendre le véhicule",
    subtitle: "Organiser votre trajet",
    items: [
      "Convenez du lieu et de l'horaire de prise en charge avec l'agence.",
      "Effectuez un état des lieux du véhicule au départ et au retour.",
      "Vérifiez les règles relatives au carburant et à l'horaire de restitution.",
    ],
  },
  {
    number: "05", icon: ShieldCheck, title: "Assurance et assistance",
    subtitle: "Les points à clarifier",
    items: [
      "Demandez quelles garanties d'assurance sont prévues pour le véhicule.",
      "Informez-vous sur l'éventuelle franchise et la procédure à suivre en cas d'incident.",
      "Faites confirmer les conditions d'assistance et les contacts utiles avant le départ.",
    ],
  },
];

const questions = [
  {q: "Quels documents prévoir ?", a: "Une pièce d'identité et un permis de conduire valides constituent une bonne base. L'agence précisera les documents réellement exigés selon votre situation."},
  {q: "Comment connaître le prix exact ?", a: "Le tarif dépend notamment des dates, de la catégorie du véhicule et des prestations choisies. Contactez l'agence pour obtenir un devis et connaître les frais éventuels."},
  {q: "La livraison du véhicule est-elle possible ?", a: "Les lieux de prise en charge et de restitution doivent être convenus directement avec l'agence. Le service et son éventuel coût ne sont pas confirmés sur cette démonstration."},
  {q: "Une caution est-elle demandée ?", a: "Le montant, le mode de dépôt et les conditions de restitution de toute caution doivent être confirmés auprès de l'agence avant de vous engager."},
];

export default function ConditionsPage() {
  const {site} = getWebsiteContent();
  return <>
    <section className="inner-hero">
      <div className="container-wide">
        <span className="eyebrow"><span className="eyebrow-line"/><Tr text=" INFORMATIONS PRATIQUES"/></span>
        <h1><Tr text="Préparez votre"/><br/><em><Tr text="location en confiance."/></em></h1>
        <div className="inner-hero-bottom">
          <p>Les points essentiels à connaître avant de louer un véhicule à Oran, présentés simplement pour vous aider à préparer votre demande.</p>
          <span className="document-update"><Info size={16}/> Guide indicatif</span>
        </div>
      </div>
    </section>

    <div className="container-wide info-page-top">
      <div className="info-disclaimer" role="note">
        <Info size={21}/>
        <p><strong>Proposition de site indépendante.</strong> Ce guide présente des informations générales, et non les conditions contractuelles de Chawki Auto. Tarifs, caution, assurance, documents et services restent à confirmer auprès de l'agence. Aucune réservation n'est enregistrée sur cette démonstration.</p>
      </div>
    </div>

    <section className="section-space container-wide conditions-layout info-page-body">
      <aside className="conditions-sidebar">
        <div className="conditions-highlight">
          <ClipboardList size={29}/>
          <h3>Besoin d'un renseignement ?</h3>
          <p>Contactez l'agence pour vérifier les disponibilités, les documents et les modalités de location.</p>
          <div className="contact-actions compact info-actions">
            <ContactWhatsAppLink/>
            <a className="button button-outline" href={`tel:${site.contact.phone}`}><PhoneCall size={16}/> Appeler l'agence</a>
          </div>
        </div>
        <div className="conditions-tip"><BadgeCheck size={21}/><p>Demandez toujours une confirmation des modalités directement à l'agence avant tout paiement.</p></div>
        <Link className="info-side-link" href="/vehicules">Explorer les véhicules <ArrowUpRight size={17}/></Link>
      </aside>

      <div className="conditions-main">
        <div className="section-heading">
          <div>
            <span className="eyebrow"><span className="eyebrow-line"/> LE GUIDE DE LOCATION</span>
            <h2>Les étapes, <span className="accent">en toute simplicité.</span></h2>
            <p>De votre première demande jusqu'au retour du véhicule, voici les sujets à aborder avec votre agence.</p>
          </div>
        </div>
        {steps.map(step => <article className="conditions-group" key={step.number}>
          <div className="conditions-group-head">
            <span>{step.number}</span>
            <div className="info-step-icon"><step.icon size={22}/></div>
            <div><h3>{step.title}</h3><p>{step.subtitle}</p></div>
          </div>
          <div className="conditions-items">{step.items.map(item => <div key={item}><Check size={18}/><p>{item}</p></div>)}</div>
        </article>)}

        <div className="faq-area">
          <span className="eyebrow"><span className="eyebrow-line"/> QUESTIONS FRÉQUENTES</span>
          <h2>Quelques réponses <span className="accent">utiles.</span></h2>
          {questions.map((question,i) => <details className="faq-item" key={question.q} open={i===0}>
            <summary><HelpCircle size={18}/>{question.q}<span aria-hidden="true">+</span></summary>
            <p>{question.a}</p>
          </details>)}
          <p className="conditions-final-note">Ce contenu est une proposition éditoriale pour présenter le futur site. Seules les informations confirmées par l'agence feront foi pour une location réelle.</p>
        </div>
      </div>
    </section>
    <section className="info-bottom-cta">
      <div className="container-wide info-bottom-inner"><div><span className="eyebrow">CONTACT DIRECT</span><h2>Une question avant de prendre la route ?</h2><p>L'agence pourra vous préciser les modalités adaptées à votre demande.</p></div><Link className="button button-primary" href="/contact">Nous contacter <ArrowUpRight size={18}/></Link></div>
    </section>
  </>;
}
