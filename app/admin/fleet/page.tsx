"use client";

import {useState} from "react";
import {SearchBox,FleetCar} from "../admin-ui";
import {FleetEditorModal,DeleteCarDialog} from "../extensions";
import type {FleetRecord} from "../extensions";
import {CrmEmpty} from "../crm-controls";
import {useAdmin} from "../admin-context";

export default function Page(){
 const {user,busy,search,setSearch,cars,updateCar,filteredCars,load,setError,setNotice}=useAdmin();
 const admin=user?.role==="admin";
 const [editing,setEditing]=useState<FleetRecord|null>(null),[deleting,setDeleting]=useState<FleetRecord|null>(null);
 return <section className="crm-panel"><div className="crm-list-toolbar"><div><h2>Votre parc automobile <span className="crm-muted-number">({cars.length})</span></h2><p>{admin?"Modifiez les fiches, photos, prix et la visibilité de chaque véhicule.":"Catalogue des véhicules publiés sur le site."}</p></div><SearchBox value={search} change={setSearch} placeholder="Rechercher un véhicule..."/></div><div className="crm-fleet-grid">{filteredCars.map(c=><FleetCar key={c.id} car={c} busy={busy} admin={admin} onToggle={available=>updateCar(c,{available})} onEdit={()=>setEditing(c as unknown as FleetRecord)} onDelete={()=>setDeleting(c as unknown as FleetRecord)}/>)}{!filteredCars.length&&<div className="crm-messages-empty"><CrmEmpty title="Aucun véhicule trouvé" description={search?`Aucun véhicule ne correspond à « ${search} ».`:"Ajoutez votre premier véhicule pour le publier sur le site."}/></div>}</div>
  {editing&&<FleetEditorModal key={editing.id} car={editing} onClose={()=>setEditing(null)} onSaved={async()=>{await load(user?.role);setNotice("Fiche véhicule enregistrée")}}/>}
  <DeleteCarDialog car={deleting} onClose={()=>setDeleting(null)} onDeleted={async()=>{await load(user?.role);setNotice("Véhicule supprimé")}} onError={setError}/>
 </section>;
}
