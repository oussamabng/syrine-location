"use client";

import {Avatar,SearchBox,money,date} from "../admin-ui";
import {CrmEmpty} from "../crm-controls";
import {useAdmin} from "../admin-context";

export default function Page(){
 const {search,setSearch,filteredCustomers}=useAdmin();
 return <section className="crm-panel"><div className="crm-list-toolbar"><div><h2>Répertoire clients</h2><p>Créé automatiquement à partir des demandes, sans doublons par téléphone.</p></div><SearchBox value={search} change={setSearch} placeholder="Nom, téléphone, email..."/></div><div className="crm-table-wrap"><table className="crm-table"><thead><tr><th>Client</th><th>Contact</th><th>Demandes</th><th>Dernière demande</th><th>Total des locations terminées</th></tr></thead><tbody>{filteredCustomers.map(c=><tr key={c.id}><td><div className="crm-client-cell"><Avatar name={c.fullName}/><b>{c.fullName}</b></div></td><td><a href={`tel:${c.phone}`}>{c.phone}</a><small>{c.email||"—"}</small></td><td>{c.bookings}</td><td>{date(c.latest)}</td><td>{money(c.totalEstimate)}</td></tr>)}{!filteredCustomers.length&&<tr><td colSpan={5} className="crm-empty-cell"><CrmEmpty title="Aucun client trouvé" description="Les clients sont créés depuis les demandes reçues."/></td></tr>}</tbody></table></div></section>;
}
