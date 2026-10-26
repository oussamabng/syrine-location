"use client";

import {useEffect,useState} from "react";
import {
 Activity,ArrowDownRight,ArrowRight,ArrowUpRight,Bell,CalendarDays,CarFront,
 Check,CheckCircle2,ChevronDown,ChevronRight,Clock3,Download,Eye,EyeOff,
 FileText,Inbox,LayoutDashboard,LockKeyhole,Menu,MessageSquare,
 MoreHorizontal,Plus,RefreshCw,Search,Settings2,ShieldCheck,SlidersHorizontal,
 Pencil,Trash2,TrendingUp,UserRound,Users,Wallet,X,XCircle
} from "lucide-react";

export type User={id:string;username:string;role:"admin"|"agent";createdAt:string;active:boolean};
export type Reservation={id:string;reference:string;carId:string;carName:string;fullName:string;phone:string;email:string;pickup:string;startDate:string;endDate:string;days:number;totalEstimate:number;note:string;status:string;createdAt:string;updatedAt:string};
export type Message={id:string;fullName:string;reply:string;subject:string;message:string;createdAt:string;status:string};
export type Car={images?:string[];id:string;name:string;year:number;color:string;transmission:string;dailyPrice:number;dailyPriceEur:number;available:boolean;featured:boolean;category?:string;seats?:number;fuel?:string};
export type Customer={id:string;fullName:string;phone:string;email:string;bookings:number;totalEstimate:number;latest:string};
export type Event={id:string;user:string;action:string;subject:string;at:string};
export type Tab="overview"|"reservations"|"messages"|"fleet"|"calendar"|"rentals"|"content"|"settings"|"customers"|"activity"|"users";
export type Status="pending"|"confirmed"|"rejected"|"completed"|"cancelled";
export const navigation:{tab:Tab;label:string;icon:typeof LayoutDashboard;group:string}[]=[
 {tab:"overview",label:"Vue d'ensemble",icon:LayoutDashboard,group:"PRINCIPAL"},
 {tab:"reservations",label:"Réservations",icon:CalendarDays,group:"PRINCIPAL"},
 {tab:"messages",label:"Messagerie",icon:Inbox,group:"PRINCIPAL"},
 {tab:"calendar",label:"Planning & disponibilité",icon:CalendarDays,group:"GESTION"},
 {tab:"rentals",label:"Locations & retours",icon:Clock3,group:"GESTION"},
 {tab:"fleet",label:"Parc automobile",icon:CarFront,group:"GESTION"},
 {tab:"customers",label:"Clients",icon:Users,group:"GESTION"},
 {tab:"content",label:"Contenus du site",icon:FileText,group:"SITE WEB"},
 {tab:"settings",label:"Paramètres du site",icon:Settings2,group:"SITE WEB"},
 {tab:"activity",label:"Historique",icon:Activity,group:"SYSTÈME"},
 {tab:"users",label:"Équipe & accès",icon:ShieldCheck,group:"SYSTÈME"}
];
export const labels:Record<string,string>={pending:"En attente",confirmed:"Confirmée",rejected:"Refusée",completed:"Terminée",cancelled:"Annulée"};
export const statusChoices:Status[]=["pending","confirmed","rejected","cancelled","completed"];
export const money=(n:number)=>new Intl.NumberFormat("fr-DZ").format(n)+" DA";
export const date=(s:string)=>s?new Date(s).toLocaleDateString("fr-DZ",{day:"2-digit",month:"short",year:"numeric"}):"—";
export const shortDate=(s:string)=>s?new Date(s+"T12:00:00").toLocaleDateString("fr-DZ",{day:"2-digit",month:"short"}):"—";
export async function request<T>(path:string,method="GET",body?:unknown):Promise<T>{
 const res=await fetch(path,{method,credentials:"same-origin",cache:"no-store",headers:body===undefined?{}:{"Content-Type":"application/json"},body:body===undefined?undefined:JSON.stringify(body)});
 const data=await res.json().catch(()=>({}));if(!res.ok)throw new Error(data.error||`Erreur ${res.status}`);return data as T;
}
export function Avatar({name}:{name:string}){return <span className="crm-avatar">{name.split(/\s+/).slice(0,2).map(s=>s[0]||"").join("").toUpperCase()}</span>}
export function StatusTag({status}:{status:string}){return <span className={`crm-status crm-status-${status}`}><i/>{labels[status]||status}</span>}
export function Detail({label,value}:{label:string;value:string}){return <div><small>{label}</small><strong>{value}</strong></div>}
export function SearchBox({value,change,placeholder}:{value:string;change:(v:string)=>void;placeholder:string}){return <label className="crm-search"><Search size={17}/><input aria-label={placeholder} placeholder={placeholder} value={value} onChange={e=>change(e.target.value)}/>{value&&<button aria-label="Effacer la recherche" onClick={()=>change("")}><X size={15}/></button>}</label>}
export function Kpi({icon:Icon,title,value,sub,accent}:{icon:typeof CalendarDays;title:string;value:string;sub:string;accent?:boolean}){return <div className={`crm-kpi ${accent?"crm-kpi-accent":""}`}><div className="crm-kpi-top"><span>{title}</span><i><Icon size={21}/></i></div><strong>{value}</strong><small>{sub}</small></div>}
export function actionLabel(action:string){const mapping:Record<string,string>={"car.created":"Véhicule ajouté","car.updated":"Véhicule modifié","user.created":"Compte créé","user.updated":"Compte modifié","message.read":"Message lu","message.unread":"Message marqué non lu","reservation.pending":"Demande remise en attente","reservation.confirmed":"Réservation confirmée","reservation.rejected":"Demande refusée","reservation.completed":"Location terminée"};return mapping[action]||action}
export function FleetCar({car,busy,admin,onToggle,onEdit,onDelete}:{car:Car;busy:boolean;admin:boolean;onToggle:(available:boolean)=>void;onEdit:()=>void;onDelete:()=>void}){
 const photos=car.images?.length||0;
 return <article className="crm-fleet-card"><div className="crm-fleet-image"><img src={car.images?.[0]||`/cars/${car.id}.webp`} alt={`${car.name} ${car.year}`} loading="lazy" onError={e=>{e.currentTarget.style.opacity="0"}}/><span className={`crm-fleet-visibility ${car.available?"visible":"hidden"}`}>{car.available?"Publié":"Masqué"}</span></div><div className="crm-fleet-content"><span className="crm-fleet-category">{car.category||"Véhicule"} · {car.transmission} · {photos} photo{photos>1?"s":""}</span><h3>{car.name} <span>{car.year}</span></h3><p>{car.color} · {car.seats||5} places</p><div className="crm-fleet-price"><strong>{money(car.dailyPrice)}</strong><small>/ jour</small></div><div className="crm-fleet-bottom"><label className="crm-switch"><input type="checkbox" checked={car.available} disabled={!admin||busy} onChange={e=>onToggle(e.target.checked)}/><span/> {car.available?"Visible sur le site":"Masqué"}</label></div>{admin&&<div className="crm-fleet-actions"><button type="button" className="crm-button crm-button-light" onClick={onEdit}><Pencil size={15}/> Modifier la fiche</button><button type="button" className="crm-button crm-button-danger" aria-label={`Supprimer ${car.name}`} title="Supprimer" onClick={onDelete}><Trash2 size={15}/></button></div>}</div></article>
}
export const tabHref=(tab:Tab)=>tab==="overview"?"/admin":`/admin/${tab}`;
export const adminOnlyTabs:Tab[]=["users","content","settings"];
export function AdminOnlyNotice(){return <div className="crm-panel"><div className="crm-empty-cell"><CrmEmptyLocal/></div></div>}
function CrmEmptyLocal(){return <div className="crm-empty-state"><span className="crm-empty-icon"><ShieldCheck size={22}/></span><strong>Accès réservé aux administrateurs</strong><p>Votre compte n'a pas accès à cette section.</p></div>}
