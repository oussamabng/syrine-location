"use client";
import { Tr } from "@/lib/i18n";
import { TextField, TextAreaField } from "@/components/ui-fields";
import { useState } from "react";
import { ArrowUpRight, Check, Info, MessageCircle } from "lucide-react";
import {useWhatsAppNumber,whatsappUrl} from "@/lib/use-public-contact";
import { useLocale } from "@/lib/i18n";
export function ContactForm(){const { t, locale } = useLocale();const whatsapp=useWhatsAppNumber();const [name,setName]=useState("");const [reply,setReply]=useState("");const [subject,setSubject]=useState("");const [body,setBody]=useState("");const [done,setDone]=useState(false);const [busy,setBusy]=useState(false);const [error,setError]=useState("");
 const message = locale === "ar"
   ? `مرحباً سيرين،\nالاسم: ${name}\nالتواصل: ${reply}\nالموضوع: ${subject}\nالرسالة: ${body}`
   : locale === "en"
     ? `Hello Syrine,\nName: ${name}\nContact: ${reply}\nSubject: ${subject}\nMessage: ${body}`
     : `Bonjour Syrine,\nNom : ${name}\nContact : ${reply}\nObjet : ${subject}\nMessage : ${body}`;
 if(done)return <div className="contact-done"><span className="success-icon"><Check/></span><h3>{locale==="ar"?"تم إرسال رسالتك":locale==="en"?"Message received":"Message enregistré"}</h3><p>{locale==="ar"?"وصلت رسالتك إلى لوحة الإدارة المحلية.":locale==="en"?"Your message has been saved for the agency to review.":"Votre message a été sauvegardé pour consultation par l’agence."}</p><a className="button button-primary" href={whatsappUrl(whatsapp,message)} target="_blank" rel="noopener noreferrer"><MessageCircle size={18}/><Tr text={" Envoyer via WhatsApp "}/><ArrowUpRight size={17}/></a><button className="reset-form" onClick={()=>setDone(false)}><Tr text={"Modifier le message"}/></button></div>;
 return <form className="contact-form" onSubmit={async e=>{e.preventDefault();if(busy)return;setBusy(true);setError("");try{
 const response=await fetch("/api/public/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({fullName:name,reply,subject,message:body})});
 const result=await response.json();if(!response.ok)throw new Error(result.error||"Erreur serveur");setDone(true)
 }catch(e){setError(e instanceof Error?e.message:"Impossible d'envoyer ce message.");}finally{setBusy(false)}
 }}>
 <div className="form-grid">
   <TextField label={t("Nom complet *")} required value={name} onChange={setName} placeholder={t("Votre nom")} autoComplete="name"/>
   <TextField label={t("Email ou téléphone *")} required value={reply} onChange={setReply} placeholder={t("Comment vous joindre ?")}/>
 </div>
 <TextField label={t("Objet")} value={subject} onChange={setSubject} placeholder={t("Ex. : Location à l’aéroport")}/>
 <TextAreaField label={t("Votre message *")} required value={body} onChange={setBody} placeholder={t("Décrivez votre besoin...")} rows={5}/>
 <button type="submit" disabled={busy} className="button button-primary">{busy?"Envoi...":locale==="ar"?"إرسال الرسالة":locale==="en"?"Send message":"Envoyer le message"}<ArrowUpRight size={17}/></button>
 <p className="demo-note"><Info size={15}/>{locale==="ar"?"يتم حفظ رسالتك في النظام المحلي.":locale==="en"?"Saved to the local agency dashboard.":"Votre message sera visible dans le tableau de bord de l’agence."}</p>{error&&<p role="alert" className="form-error">{error}</p>}
 </form>;
}
