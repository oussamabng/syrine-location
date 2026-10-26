"use client";

import {Activity} from "lucide-react";
import {actionLabel,date} from "../admin-ui";
import {ClearActivity} from "../extensions";
import {CrmEmpty} from "../crm-controls";
import {useAdmin} from "../admin-context";

export default function Page(){
 const {user,activity,load}=useAdmin();
 return <>{user?.role==="admin"&&<ClearActivity onUpdated={()=>load(user?.role)}/>}<section className="crm-panel"><div className="crm-panel-heading"><div><h2>Journal d'activité</h2><p>Actions récentes dans l'espace de gestion</p></div><Activity size={20}/></div><div className="crm-timeline">{activity.map(a=><div className="crm-timeline-item" key={a.id}><span className="crm-timeline-icon"><Activity size={15}/></span><div><b>{actionLabel(a.action)}</b><p>{a.subject||"—"} · par {a.user}</p></div><time>{date(a.at)}</time></div>)}{!activity.length&&<CrmEmpty title="Aucune activité enregistrée" description="Les actions de votre équipe (réservations, véhicules, comptes) apparaîtront ici."/>}</div></section></>;
}
