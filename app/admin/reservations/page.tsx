"use client";

import {ChevronRight} from "lucide-react";
import {StatusTag,SearchBox,money,date,shortDate} from "../admin-ui";
import {CrmEmpty} from "../crm-controls";
import {useAdmin} from "../admin-context";

export default function Page(){
 const {search,setSearch,filter,setFilter,setSelected,pending,filteredBookings}=useAdmin();
 return <section className="crm-panel"><div className="crm-list-toolbar"><div className="crm-tabs">{[{k:"all",label:"Toutes"},{k:"pending",label:"En attente"},{k:"confirmed",label:"Confirmées"},{k:"completed",label:"Terminées"},{k:"rejected",label:"Refusées"},{k:"cancelled",label:"Annulées"}].map(i=><button className={filter===i.k?"active":""} onClick={()=>setFilter(i.k)} key={i.k}>{i.label}{i.k==="pending"&&pending>0&&<b>{pending}</b>}</button>)}</div><SearchBox value={search} change={setSearch} placeholder="Client, véhicule, référence..."/></div><div className="crm-table-wrap"><table className="crm-table crm-bookings-table"><thead><tr><th>Référence / client</th><th>Véhicule</th><th>Période</th><th>Estimation</th><th>Statut</th><th></th></tr></thead><tbody>{filteredBookings.map(b=><tr key={b.id} className="crm-clickable" onClick={()=>setSelected(b)}><td><b>{b.fullName}</b><small>{b.reference} · {date(b.createdAt)}</small></td><td>{b.carName}</td><td><span>{shortDate(b.startDate)} — {shortDate(b.endDate)}</span><small>{b.days} jours</small></td><td><b>{money(b.totalEstimate)}</b></td><td><StatusTag status={b.status}/></td><td><ChevronRight size={18}/></td></tr>)}{!filteredBookings.length&&<tr><td className="crm-empty-cell" colSpan={6}><CrmEmpty title="Aucune demande trouvée" description="Essayez un autre filtre ou attendez une nouvelle réservation."/></td></tr>}</tbody></table></div><div className="crm-table-footer">{filteredBookings.length} demande(s) affichée(s)</div></section>;
}
