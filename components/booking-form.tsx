"use client";
import {useWhatsAppNumber,whatsappUrl} from "@/lib/use-public-contact";
import { Tr } from "@/lib/i18n";
import { DateField, SelectField, TextField } from "@/components/ui-fields";
import { useEffect, useState } from "react";
import { Check, ArrowRight, Phone, ShieldCheck, CalendarDays, MessageCircle, Info } from "lucide-react";
import Link from "next/link";
import { type Vehicle, rentalDays, moneyDzd, moneyEur, waLink } from "@/lib/data";
import { useLocale } from "@/lib/i18n";
export function BookingForm({ vehicle }: { vehicle: Vehicle }) {
 const { t, locale } = useLocale();const whatsappNumber=useWhatsAppNumber();
 const [reference,setReference]=useState("");const [sending,setSending]=useState(false);const [name,setName]=useState("");const [phone,setPhone]=useState("");const [email,setEmail]=useState("");const [start,setStart]=useState("");const [end,setEnd]=useState("");const [currency,setCurrency]=useState<"DZD"|"EUR">("DZD");const [accepted,setAccepted]=useState(false);const [confirmed,setConfirmed]=useState(false);const [error,setError]=useState("");
 useEffect(()=>{try{const raw=sessionStorage.getItem("syrine-demo-dates");if(raw){const data=JSON.parse(raw);if(data.start)setStart(data.start);if(data.end)setEnd(data.end);}}catch{}},[]);
 const days=rentalDays(start,end);const now=new Date();const today=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;const total=days*(currency==="DZD"?vehicle.priceDzd:vehicle.priceEur);
 const price = currency === "DZD" ? moneyDzd(total) : moneyEur(total);
 const message = locale === "ar"
   ? `مرحباً سيرين، أود استئجار ${vehicle.name} ${vehicle.year} (${t(vehicle.transmission)}).\nالاسم: ${name}\nالهاتف: ${phone}\nمن ${start} إلى ${end} (${days} أيام).\nالسعر التقديري: ${price}.\nهل يمكن تأكيد التوفر والسعر النهائي؟`
   : locale === "en"
     ? `Hello Syrine, I'd like to rent ${vehicle.name} ${vehicle.year} (${t(vehicle.transmission)}).\nName: ${name}\nPhone: ${phone}\nFrom ${start} to ${end} (${days} days).\nEstimated cost: ${price}.\nCould you confirm availability and the final quote?`
     : `Bonjour Syrine, je souhaite louer ${vehicle.name} ${vehicle.year} (${vehicle.transmission}).\nNom : ${name}\nTéléphone : ${phone}\nDu ${start} au ${end} (${days} jours).\nEstimation indicative : ${price}.\nPouvez-vous me confirmer la disponibilité et le devis ?`;
 async function submit(e:React.FormEvent){
   e.preventDefault();
   if(sending)return;
   if(!name.trim()||phone.replace(/\D/g,"").length<8){setError(t("Indiquez votre nom et un numéro de téléphone valide."));return;}
   if(email.trim()&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())){setError(t("Adresse email invalide."));return;}
   if(days<5||days>90){setError(t("La durée minimum de location est de 5 jours.") + (days>90?" (Maximum : 90 jours)":""));return;}
   if(!accepted){setError(t("Merci d’accepter les conditions de location."));return;}
   setSending(true);setError("");
   try {
     const response=await fetch("/api/public/reservations",{
       method:"POST",headers:{"Content-Type":"application/json"},
       body:JSON.stringify({carId:vehicle.slug,fullName:name.trim(),phone:phone.trim(),email:email.trim(),pickup:"Oran",startDate:start,endDate:end,note:`Langue: ${locale}; Devise affichée: ${currency}; Estimation client: ${price}`})
     });
     const payload=await response.json();
     if(!response.ok)throw new Error(payload.error||"Erreur serveur");
     if(payload.booking.trackToken){try{const key='syrine-my-rentals';const current=JSON.parse(localStorage.getItem(key)||'[]') as string[];localStorage.setItem(key,JSON.stringify([...new Set([...current,payload.booking.trackToken])].slice(-10)));window.dispatchEvent(new Event('syrine-new-booking'));}catch{}}
     setReference(payload.booking.reference);
     setConfirmed(true);
   }catch(e){setError(e instanceof Error?e.message:"Impossible d'envoyer la demande. Réessayez plus tard.");}
   finally{setSending(false);}
 }
 if(confirmed)return <div className="booking-success"><div className="success-icon"><Check size={28}/></div><h3>{locale==="ar"?"تم تسجيل طلبك":locale==="en"?"Request received":"Demande enregistrée"}</h3>
 <p>{locale==="ar"?"تم حفظ الطلب في النظام. سيتم تأكيد التوفر والسعر النهائي من طرف الوكالة.":locale==="en"?"Your request is saved. The agency must still confirm availability and the final price.":"Votre demande est enregistrée. L’agence doit encore confirmer la disponibilité et le tarif final."}</p>
 <strong className="booking-reference">{reference}</strong><div className="booking-recap"><span>{vehicle.name}</span><strong>{start} → {end}</strong><span>{days} <Tr text="jours"/> · {currency==="DZD"?moneyDzd(total):moneyEur(total)}<Tr text=" estimés"/></span></div><a href={whatsappUrl(whatsappNumber,message)} target="_blank" rel="noopener noreferrer" className="button button-primary button-full"><MessageCircle size={18}/><Tr text={" Envoyer sur WhatsApp "}/><ArrowRight size={17}/></a><button className="reset-form" onClick={()=>setConfirmed(false)} type="button"><Tr text={"Modifier ma demande"}/></button></div>;
 return <form className="booking-form" onSubmit={submit} noValidate><div className="booking-form-top"><span className="booking-kicker"><Tr text={"VOTRE DEMANDE DE LOCATION"}/></span><div className="booking-price"><strong>{currency==="DZD"?moneyDzd(vehicle.priceDzd):moneyEur(vehicle.priceEur)}</strong><span><Tr text={" / jour"}/></span></div><p>{currency==="DZD"?moneyEur(vehicle.priceEur):moneyDzd(vehicle.priceDzd)}<Tr text=" également affiché sur l’ancien site"/></p></div>
 <div className="booking-body"><div className="form-grid">
 <TextField label={t("Nom complet *")} value={name} onChange={setName} required autoComplete="name" placeholder={t("Votre nom et prénom")} />
 <TextField label={t("Téléphone *")} value={phone} onChange={setPhone} type="tel" inputMode="tel" required autoComplete="tel" placeholder="+213 ..." />
 <div style={{gridColumn:"1 / -1"}}><TextField label={t("Email (facultatif)")} value={email} onChange={setEmail} type="email" inputMode="email" autoComplete="email" placeholder="nom@exemple.com" /></div>
 <div className="form-field"><span><Tr text="Date de départ *"/></span><DateField label={t("Date de départ")} required min={today} value={start} onChange={date=>{setStart(date);if(end&&date&&end<date)setEnd("");}} /></div>
 <div className="form-field"><span><Tr text="Date de retour *"/></span><DateField label={t("Date de retour")} required min={start||today} value={end} onChange={setEnd} align="end" /></div>
 </div>
 <div className="form-field"><span><Tr text="Devise"/></span>
   <SelectField label={t("Devise")} value={currency} onChange={value=>setCurrency(value as "DZD"|"EUR")}
     options={[{value:"DZD",label:t("Dinar algérien (DZD)")},{value:"EUR",label:t("Euro (EUR)")}]} />
 </div>
 {start&&end&&days>=5&&<div className="price-summary"><div><span>{days} <Tr text="jours"/> × {currency==="DZD"?moneyDzd(vehicle.priceDzd):moneyEur(vehicle.priceEur)}</span><strong>{currency==="DZD"?moneyDzd(total):moneyEur(total)}</strong></div><small><Tr text={"Estimation indicative · tarifs et disponibilités à confirmer avec l’agence."}/></small></div>}
 <label className="consent-field"><input type="checkbox" checked={accepted} onChange={e=>setAccepted(e.target.checked)} /><span><Tr text="J’ai lu et j’accepte les "/><Link href="/conditions" target="_blank"><Tr text={"conditions de location"}/></Link>.</span></label>
 {error&&<div className="form-error" role="alert">{error}</div>}
 <button className="button button-primary button-full" type="submit" disabled={sending}>{sending?(locale==="ar"?"جارٍ الإرسال...":locale==="en"?"Sending...":"Envoi..."):(locale==="ar"?"إرسال الطلب":locale==="en"?"Send booking request":"Envoyer la demande")}<ArrowRight size={18}/></button><p className="demo-note"><Info size={15}/>{locale==="ar"?"طلب مبدئي، وليس تأكيداً للحجز.":locale==="en"?"This is a booking request, not a confirmed reservation.":"Demande sans paiement, sous réserve de confirmation par l’agence."}</p>
 <div className="booking-reassurance"><span><ShieldCheck size={16}/><Tr text={" Aucun paiement en ligne"}/></span><span><CalendarDays size={16}/><Tr text={" Minimum 5 jours"}/></span><span><Phone size={16}/><Tr text={" Confirmation par l’agence"}/></span></div></div></form>;
}
