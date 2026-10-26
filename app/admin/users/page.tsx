"use client";

import {ShieldCheck} from "lucide-react";
import {Avatar,date} from "../admin-ui";
import {AdminOnlyNotice} from "../admin-ui";
import {useAdmin} from "../admin-context";

export default function Page(){
 const {user,busy,messages,users,setResetFor,setResetValue,toggleUser}=useAdmin();
 if(user?.role!=="admin")return <AdminOnlyNotice/>;
 return <section className="crm-panel"><div className="crm-panel-heading"><div><h2>Comptes collaborateurs</h2><p>Administrateurs : accès complet. Agents : demandes, messages et clients uniquement.</p></div><ShieldCheck size={20}/></div><div className="crm-team-list">{users.map(u=><div className="crm-team-row" key={u.id}><Avatar name={u.username}/><div><b>{u.username}{u.id===user.id&&" (vous)"}</b><small>Créé le {date(u.createdAt)}</small></div><span className="crm-role">{u.role==="admin"?"Administrateur":"Agent"}</span><span className={u.active?"crm-user-active":"crm-user-inactive"}>{u.active?"Actif":"Désactivé"}</span><button className="crm-button crm-button-light" disabled={busy} onClick={()=>{setResetFor(u);setResetValue("")}}>Mot de passe</button>{u.id!==user.id&&<button className="crm-button crm-button-light" disabled={busy} onClick={()=>toggleUser(u)}>{u.active?"Désactiver":"Activer"}</button>}</div>)}</div></section>;
}
