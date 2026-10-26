"use client";
import {useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {en} from '@/lib/translations';
import {useRouter} from 'next/navigation';
import {ConfirmDialog,CrmSelect,CrmEmpty,useOutside} from './crm-controls';
import {ArrowRight,CalendarDays,CarFront,Check,ChevronDown,ChevronLeft,ChevronRight,Clock3,ImagePlus,Plus,RotateCcw,Save,Search,Trash2,Upload, X} from 'lucide-react';

type Car={id:string;name:string;year:number;color:string;transmission:string;dailyPrice:number;dailyPriceEur:number;category:string;seats:number;fuel:string;description:string;descriptions?:Dict;available:boolean;featured:boolean;images:string[]};
type Booking={id:string;reference:string;carId:string;carName:string;fullName:string;startDate:string;endDate:string;status:string;rental?:{startedAt:string;endsAt:string;returnedAt:string|null}|null};
type Block={id:string;carId:string;startDate:string;endDate:string;reason:string};
type Dict=Record<'fr'|'en'|'ar',string>;
type Item={id:string;off:boolean; q?:Dict;a?:Dict;t?:Dict;b?:Dict;n?:string;r?:number};
type Kind='faq'|'tes'|'terms';
type Site={contact:{phone:string;whatsapp:string;email:string;tiktok:string;map:string;mapEmbed:string;copyright:string};appearance:{accent:string;mode:string};sections:Record<string,boolean>;copy:Record<string,Dict>};
type Cms={faq:Item[];tes:Item[];terms:Item[];termsHistory:{id:string;at:string;items:Item[]}[]};
async function api<T>(path:string,method='GET',payload?:unknown):Promise<T>{const r=await fetch(path,{method,credentials:'same-origin',cache:'no-store',headers:payload===undefined?{}:{'Content-Type':'application/json'},body:payload===undefined?undefined:JSON.stringify(payload)});const data=await r.json().catch(()=>({}));if(!r.ok)throw new Error(data.error||`Erreur HTTP ${r.status}`);return data as T;}
const iso=(d:Date)=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const dateText=(s:string)=>s?new Date(s+'T12:00:00').toLocaleDateString('fr-DZ'):'—';
const empty:Dict={fr:'',en:'',ar:''};
const translated=(value?:Dict)=>value?.fr||value?.en||value?.ar||'—';
const kinds:{key:Kind;name:string}[]=[{key:'faq',name:'FAQ'},{key:'terms',name:'Conditions'}];
const copyKeys=[{key:'hero_title',name:'Titre principal'},{key:'hero_subtitle',name:'Sous-titre du hero'},{key:'airport_title',name:'Titre livraison aéroport'},{key:'contact_intro',name:'Introduction contact'},{key:'footer_tagline',name:'Texte du pied de page'}];
function Action({children,onClick,disabled,destructive}:{children:React.ReactNode;onClick:()=>void;disabled?:boolean;destructive?:boolean}){return <button type="button" className={'crm-button '+(destructive?'crm-button-danger':'crm-button-light')} onClick={onClick} disabled={disabled}>{children}</button>}
function MultiField({label,value,onChange,multiline=false}:{label:string;value:Dict;onChange:(v:Dict)=>void;multiline?:boolean}){return <fieldset className="crm-multilang"><legend>{label}</legend><div>{(['fr','en','ar'] as const).map(l=><label key={l}>{l.toUpperCase()}{multiline?<textarea dir={l==='ar'?'rtl':'ltr'} rows={3} value={value[l]||''} onChange={e=>onChange({...value,[l]:e.target.value})}/>:<input dir={l==='ar'?'rtl':'ltr'} value={value[l]||''} onChange={e=>onChange({...value,[l]:e.target.value})}/>}</label>)}</div></fieldset>}
function ErrorBox({message}:{message:string}){return message?<p className="crm-ext-error" role="alert">{message}</p>:null}
function BusyState({busy}:{busy:boolean}){return busy?<p className="crm-ext-muted">Chargement des données…</p>:null}
type Entry={id:string;startDate:string;endDate:string;tag:'busy'|'pending'|'block';title:string;sub:string};
type CarState='free'|'busy'|'pending'|'block';
const tagName={busy:'Réservé',pending:'Demande',block:'Bloqué'} as const;
const stateName:Record<CarState,string>={free:'Libre',busy:'Réservé',pending:'Demande',block:'Bloqué'};
const reasonPresets=['Maintenance','Location hors site','Usage interne'];
const PAGE=20;
const dayShort=(s:string)=>new Date(s+'T12:00:00').toLocaleDateString('fr-FR',{day:'numeric',month:'short'});
const addDays=(s:string,n:number)=>{const d=new Date(s+'T12:00:00');d.setDate(d.getDate()+n);return iso(d)};
const dayDiff=(a:string,b:string)=>Math.round((new Date(b+'T12:00:00').getTime()-new Date(a+'T12:00:00').getTime())/86400000);
function VehiclePicker({cars,value,onChange,stateOf}:{cars:Car[];value:string;onChange:(id:string)=>void;stateOf:(id:string)=>CarState}){
 const ref=useRef<HTMLDivElement>(null),input=useRef<HTMLInputElement>(null),[open,setOpen]=useState(false),[query,setQuery]=useState(''),[visible,setVisible]=useState(PAGE);
 useOutside(ref,open,()=>setOpen(false));
 useEffect(()=>{if(open)input.current?.focus();else{setQuery('');setVisible(PAGE)}},[open]);
 useEffect(()=>{setVisible(PAGE)},[query]);
 const current=cars.find(c=>c.id===value);
 const q=query.trim().toLowerCase();
 const list=q?cars.filter(c=>`${c.name} ${c.year} ${c.color}`.toLowerCase().includes(q)):cars;
 const shown=list.slice(0,visible);
 const more=(e:React.UIEvent<HTMLDivElement>)=>{const el=e.currentTarget;if(visible<list.length&&el.scrollTop+el.clientHeight>=el.scrollHeight-90)setVisible(v=>v+PAGE)};
 const row=(c:Car)=>{const st=stateOf(c.id);return <><span className="crm-cal-thumb">{c.images?.[0]?<img src={c.images[0]} alt="" loading="lazy"/>:<CarFront size={18}/>}</span><span className="crm-cal-vehicle-text"><strong>{c.name}</strong><small>{c.year} · {c.color}</small></span><span className={`crm-cal-state is-${st}`}>{stateName[st]}</span></>};
 return <div className="crm-cal-picker" ref={ref}>
  <span className="crm-cal-picker-label">Véhicule sélectionné</span>
  <button type="button" className="crm-cal-picker-trigger" aria-haspopup="listbox" aria-expanded={open} onClick={()=>setOpen(v=>!v)}>
   {current?row(current):<span className="crm-cal-vehicle-text"><strong>Choisir un véhicule</strong></span>}
   <ChevronDown size={18} className="crm-cal-picker-chevron"/>
  </button>
  {open&&<div className="crm-cal-picker-menu">
   <label className="crm-search"><Search size={16}/><input ref={input} aria-label="Rechercher un véhicule" placeholder={`Rechercher parmi ${cars.length} véhicules…`} value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&list[0]){e.preventDefault();onChange(list[0].id);setOpen(false)}}}/>{query&&<button type="button" aria-label="Effacer la recherche" onClick={()=>setQuery('')}><X size={14}/></button>}</label>
   <div className="crm-cal-picker-list" role="listbox" aria-label="Véhicules" onScroll={more}>
    {shown.map(c=><button type="button" role="option" aria-selected={c.id===value} key={c.id} className={`crm-cal-vehicle ${c.id===value?'active':''}`} onClick={()=>{onChange(c.id);setOpen(false)}}>{row(c)}{c.id===value&&<Check size={17} className="crm-cal-check"/>}</button>)}
    {!list.length&&<p className="crm-cal-picker-empty">Aucun véhicule trouvé.</p>}
    {visible<list.length&&<button type="button" className="crm-cal-more" onClick={()=>setVisible(v=>v+PAGE)}>Afficher plus · {shown.length} sur {list.length}</button>}
   </div>
   {list.length>0&&<small className="crm-cal-picker-count">{shown.length} sur {list.length} véhicule{list.length>1?'s':''}{q?' trouvés':''} · faites défiler pour en voir plus</small>}
  </div>}
 </div>
}
function MonthPicker({month,onChange}:{month:Date;onChange:(d:Date)=>void}){
 const ref=useRef<HTMLDivElement>(null),[open,setOpen]=useState(false),[year,setYear]=useState(month.getFullYear());
 useOutside(ref,open,()=>setOpen(false));
 useEffect(()=>{if(open)setYear(month.getFullYear())},[open,month]);
 const names=Array.from({length:12},(_,i)=>new Date(2026,i,1).toLocaleDateString('fr-FR',{month:'short'}));
 const now=new Date();
 return <div className="crm-cal-month" ref={ref}>
  <button type="button" className="crm-cal-month-trigger" aria-haspopup="dialog" aria-expanded={open} onClick={()=>setOpen(v=>!v)}><span>{month.toLocaleDateString('fr-FR',{month:'long',year:'numeric'})}</span><ChevronDown size={16}/></button>
  {open&&<div className="crm-cal-month-menu" role="dialog" aria-label="Choisir le mois et l’année">
   <div className="crm-cal-year"><button type="button" aria-label="Année précédente" onClick={()=>setYear(y=>y-1)}><ChevronLeft size={17}/></button><strong>{year}</strong><button type="button" aria-label="Année suivante" onClick={()=>setYear(y=>y+1)}><ChevronRight size={17}/></button></div>
   <div className="crm-cal-months">{names.map((n,i)=><button type="button" key={n} className={`${year===month.getFullYear()&&i===month.getMonth()?'active':''} ${year===now.getFullYear()&&i===now.getMonth()?'now':''}`} onClick={()=>{onChange(new Date(year,i,1));setOpen(false)}}>{n}</button>)}</div>
  </div>}
 </div>
}
export function CalendarModule({cars}:{cars:Car[]}){
 const [bookings,setBookings]=useState<Booking[]>([]),[blocks,setBlocks]=useState<Block[]>([]),[month,setMonth]=useState(()=>new Date(new Date().getFullYear(),new Date().getMonth(),1)),[carId,setCarId]=useState(''),[from,setFrom]=useState(''),[to,setTo]=useState(''),[reason,setReason]=useState(''),[error,setError]=useState(''),[loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[deleteBlock,setDeleteBlock]=useState<string|null>(null);
 const today=iso(new Date());
 const load=useCallback(async()=>{setLoading(true);try{const r=await api<{bookings:Booking[];blocks:Block[]}>('/api/admin/calendar');setBookings(r.bookings);setBlocks(r.blocks);setError('')}catch(e){setError((e as Error).message)}finally{setLoading(false)}},[]);
 useEffect(()=>{void load()},[load]);useEffect(()=>{if(!carId&&cars[0])setCarId(cars[0].id)},[cars,carId]);
 const entriesByCar=useMemo(()=>{
  const map=new Map<string,Entry[]>();
  const add=(id:string,e:Entry)=>{const list=map.get(id);if(list)list.push(e);else map.set(id,[e])};
  for(const b of bookings)if(!['cancelled','rejected'].includes(b.status))add(b.carId,{id:b.id,startDate:b.startDate,endDate:b.endDate,tag:b.status==='pending'?'pending':'busy',title:b.fullName,sub:b.reference});
  for(const b of blocks)add(b.carId,{id:b.id,startDate:b.startDate,endDate:b.endDate,tag:'block',title:b.reason||'Indisponible',sub:'Blocage manuel'});
  for(const list of map.values())list.sort((a,b)=>a.startDate.localeCompare(b.startDate));
  return map;
 },[bookings,blocks]);
 const stateOf=(id:string):CarState=>{const now=(entriesByCar.get(id)||[]).filter(e=>e.startDate<=today&&e.endDate>today);return now.some(e=>e.tag==='busy')?'busy':now.some(e=>e.tag==='pending')?'pending':now.some(e=>e.tag==='block')?'block':'free'};
 const car=cars.find(c=>c.id===carId);
 const entries=entriesByCar.get(carId)||[];
 const entryOn=(d:string)=>entries.find(e=>e.startDate<=d&&e.endDate>d);
 const first=(new Date(month.getFullYear(),month.getMonth(),1).getDay()+6)%7,total=new Date(month.getFullYear(),month.getMonth()+1,0).getDate();
 const last=to||from,count=from?dayDiff(from,last)+1:0;
 const clear=()=>{setFrom('');setTo('');setReason('');setError('')};
 function pick(d:string){
  setError('');
  if(!from||to){setFrom(d);setTo('');return}
  if(d<from){setFrom(d);return}
  for(let x=from;x<=d;x=addDays(x,1))if(entryOn(x)){setError('Cette période chevauche une réservation ou un blocage existant.');return}
  setTo(d);
 }
 async function addBlock(){if(!from||!carId)return;setSaving(true);try{await api('/api/admin/calendar/blocks','POST',{carId,startDate:from,endDate:addDays(last,1),reason});clear();await load()}catch(e){setError((e as Error).message)}finally{setSaving(false)}}
 async function removeBlock(id:string){try{await api(`/api/admin/calendar/blocks/${id}`,'DELETE');await load()}catch(e){setError((e as Error).message)}finally{setDeleteBlock(null)}}
 const changeMonth=(dir:number)=>setMonth(new Date(month.getFullYear(),month.getMonth()+dir,1));
 const note=error||(!from?'Cliquez sur le premier jour dans le calendrier.':!to?'Cliquez sur le dernier jour, ou bloquez ce seul jour.':`${count} jour${count>1?'s':''} sélectionné${count>1?'s':''}.`);
 return <div className="crm-cal">
  <section className="crm-panel crm-cal-main">
   <div className="crm-cal-toolbar">
    <VehiclePicker cars={cars} value={carId} stateOf={stateOf} onChange={id=>{setCarId(id);clear()}}/>
    <div className="crm-cal-nav"><Action onClick={()=>changeMonth(-1)}><ChevronLeft size={18}/></Action><MonthPicker month={month} onChange={setMonth}/><Action onClick={()=>changeMonth(1)}><ChevronRight size={18}/></Action><Action onClick={()=>setMonth(new Date(new Date().getFullYear(),new Date().getMonth(),1))}>Aujourd’hui</Action></div>
   </div>
   <div className="crm-cal-weekdays">{['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'].map(w=><span key={w}>{w}</span>)}</div>
   <div className="crm-cal-grid">
    {Array.from({length:first},(_,i)=><span key={'e'+i}/>)}
    {Array.from({length:total},(_,i)=>{
     const d=iso(new Date(month.getFullYear(),month.getMonth(),i+1)),hit=entryOn(d),past=d<today;
     const inRange=!!from&&d>=from&&d<=last;
     const showLabel=hit&&(hit.startDate===d||i===0||(first+i)%7===0);
     return <button type="button" key={d} disabled={hit?hit.tag!=='block':past} onClick={()=>hit?setDeleteBlock(hit.id):pick(d)} title={hit?(hit.tag==='block'?'Bloqué — cliquer pour supprimer':`${tagName[hit.tag]} · ${hit.title}`):past?'Date passée':'Cliquer pour sélectionner'}
      className={`crm-cal-cell ${hit?'is-'+hit.tag:''} ${past?'is-past':''} ${inRange?'is-picked':''} ${d===today?'is-today':''}`}>
      <b>{i+1}</b>{showLabel&&<small>{hit.tag==='block'?'Bloqué':hit.title}</small>}
     </button>})}
   </div>
   <div className="crm-cal-foot"><div className="crm-cal-legend"><span><i className="free"/>Disponible</span><span><i className="busy"/>Réservé</span><span><i className="pending"/>Demande</span><span><i className="block"/>Bloqué</span><span><i className="picked"/>Sélection</span></div><span className="crm-cal-tip">Cliquez sur un jour bloqué pour le supprimer</span></div>
  </section>
  <div className="crm-cal-side">
   <section className="crm-panel crm-cal-block">
    <div className="crm-panel-heading"><div><h2>Bloquer une période</h2><p>Rendre {car?.name||'ce véhicule'} indisponible</p></div></div>
    <div className="crm-cal-block-body">
     <div className="crm-cal-range">
      <div className={from?'is-set':''}><small>Début</small><strong>{from?dayShort(from):'—'}</strong></div>
      <ArrowRight size={18}/>
      <div className={from?'is-set':''}><small>Fin</small><strong>{from?dayShort(last):'—'}</strong></div>
     </div>
     <p className={`crm-cal-note ${error?'is-error':''}`} role={error?'alert':undefined}>{note}</p>
     <label className="crm-cal-reason">Motif <em>(optionnel)</em><input className="crm-input" maxLength={150} disabled={!from} value={reason} onChange={e=>setReason(e.target.value)} placeholder="Ex. maintenance, location hors site…"/></label>
     <div className="crm-cal-presets">{reasonPresets.map(p=><button type="button" key={p} disabled={!from} className={reason===p?'active':''} onClick={()=>setReason(p)}>{p}</button>)}</div>
     <div className="crm-cal-block-actions"><button type="button" className="crm-button crm-button-primary" disabled={!from||saving} onClick={()=>void addBlock()}><Plus size={16}/> {saving?'Enregistrement…':'Bloquer ces dates'}</button><button type="button" className="crm-button crm-button-outline" disabled={!from} onClick={clear}>Effacer</button></div>
    </div>
   </section>
  </div>
  <ConfirmDialog open={!!deleteBlock} title="Supprimer ce blocage ?" description="Cette période redeviendra disponible. Les réservations existantes ne seront pas modifiées." confirmLabel="Supprimer le blocage" destructive onCancel={()=>setDeleteBlock(null)} onConfirm={()=>{if(deleteBlock)void removeBlock(deleteBlock)}}/>
 </div>
}
export function RentalsModule({cars}:{cars:Car[]}){
 const [bookings,setBookings]=useState<Booking[]>([]),[error,setError]=useState(''),[loading,setLoading]=useState(true),[pendingAct,setPendingAct]=useState<{booking:Booking;action:string}|null>(null);
 const load=useCallback(async()=>{setLoading(true);try{const r=await api<{bookings:Booking[]}>('/api/admin/reservations');setBookings(r.bookings);setError('')}catch(e){setError((e as Error).message)}finally{setLoading(false)}},[]);useEffect(()=>{void load()},[load]);
 async function act(b:Booking,action:string){try{if(action==='delete')await api(`/api/admin/reservations/${b.id}`,'DELETE');else if(['start','end','reset'].includes(action))await api(`/api/admin/reservations/${b.id}/rental`,'PATCH',{action});else await api(`/api/admin/reservations/${b.id}`,'PATCH',{status:action});await load()}catch(e){setError((e as Error).message)}}
 const show=[...bookings].sort((a,b)=>a.startDate.localeCompare(b.startDate));
 return <section className="crm-panel crm-ext-panel"><h2><Clock3 size={19}/> Locations, retours et annulations</h2><p className="crm-ext-muted">Démarrez le minuteur uniquement après remise du véhicule. Les périodes confirmées bloquent les nouvelles confirmations. Le temps restant est calculé côté serveur.</p><ErrorBox message={error}/><BusyState busy={loading}/><div className="crm-ext-table"><table><thead><tr><th>Demande</th><th>Véhicule</th><th>Dates</th><th>État / minuteur</th><th>Actions</th></tr></thead><tbody>{show.map(b=><tr key={b.id}><td><strong>{b.reference}</strong><small>{b.fullName}</small></td><td>{b.carName||cars.find(c=>c.id===b.carId)?.name}</td><td>{dateText(b.startDate)} → {dateText(b.endDate)}</td><td><span className="crm-ext-pill">{({pending:'En attente',confirmed:'Confirmée',completed:'Terminée',rejected:'Refusée',cancelled:'Annulée'} as Record<string,string>)[b.status]||b.status}</span>{b.rental?.startedAt&&<small>Début : {new Date(b.rental.startedAt).toLocaleString('fr-DZ')}<br/>Fin prévue : {new Date(b.rental.endsAt).toLocaleString('fr-DZ')}<br/>{b.rental.returnedAt?'Retourné le '+new Date(b.rental.returnedAt).toLocaleString('fr-DZ'):'Location en cours'}</small>}</td><td><div className="crm-ext-actions">{b.status==='confirmed'&&!b.rental?.startedAt&&<Action onClick={()=>act(b,'start')}><Clock3 size={15}/> Début</Action>}{b.rental?.startedAt&&!b.rental.returnedAt&&<Action onClick={()=>act(b,'end')}><Check size={15}/> Retour</Action>}{b.rental?.startedAt&&<Action onClick={()=>setPendingAct({booking:b,action:'reset'})}><RotateCcw size={15}/> Reset</Action>}{b.status==='pending'&&<Action onClick={()=>act(b,'confirmed')}>Confirmer</Action>}{!b.rental?.startedAt&&['pending','confirmed'].includes(b.status)&&<Action onClick={()=>act(b,'cancelled')}>Annuler</Action>}<Action destructive onClick={()=>setPendingAct({booking:b,action:'delete'})}><Trash2 size={15}/></Action></div></td></tr>)}</tbody></table></div>{show.length===0&&!loading&&<CrmEmpty title="Aucune location" description="Les réservations apparaîtront ici dès leur création."/>}<ConfirmDialog open={!!pendingAct} title={pendingAct?.action==='delete'?"Supprimer cette réservation ?":"Réinitialiser le minuteur ?"} description={pendingAct?.action==='delete'?"Cette action supprime définitivement la réservation et son historique.":"Le suivi temporel de la location sera remis à zéro."} destructive confirmLabel={pendingAct?.action==='delete'?"Supprimer la réservation":"Réinitialiser"} onCancel={()=>setPendingAct(null)} onConfirm={()=>{if(pendingAct)void act(pendingAct.booking,pendingAct.action).finally(()=>setPendingAct(null))}}/></section>
}
export type FleetRecord=Car;
export function FleetEditorModal({car,onClose,onSaved}:{car:Car;onClose:()=>void;onSaved:()=>Promise<void>}){
 const [draft,setDraft]=useState<Car>(()=>({...car,images:[...(car.images||[])]})),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 async function upload(file:File){setBusy(true);setError('');try{const r=await fetch('/api/admin/upload',{method:'POST',headers:{'Content-Type':file.type},body:file});const data=await r.json();if(!r.ok)throw new Error(data.error||'Téléversement échoué');setDraft(d=>(d.images||[]).length>=6?d:{...d,images:[...(d.images||[]),data.url]})}catch(e){setError((e as Error).message)}finally{setBusy(false)}}
 async function save(){setBusy(true);try{await api(`/api/admin/cars/${draft.id}`,'PATCH',draft);await onSaved();onClose()}catch(e){setError((e as Error).message)}finally{setBusy(false)}}
 return <div className="crm-modal-overlay"><div className="crm-modal crm-ext-modal"><header className="crm-ext-head"><h2>Modifier {draft.name}</h2><button type="button" className="crm-icon-close" aria-label="Fermer" onClick={()=>onClose()}><X size={20}/></button></header><div className="crm-ext-form crm-ext-form-cols">{(['name','color','fuel','category','description'] as const).map(key=><label key={key}>{({name:'Modèle',color:'Couleur',fuel:'Carburant',category:'Catégorie',description:'Description'} as Record<string,string>)[key]}<input value={draft[key]||''} onChange={e=>setDraft({...draft,[key]:e.target.value})}/></label>)}{(['year','seats','dailyPrice','dailyPriceEur'] as const).map(key=><label key={key}>{({year:'Année',seats:'Places',dailyPrice:'DA/j',dailyPriceEur:'EUR/j'} as Record<string,string>)[key]}<input type="number" min={key==='seats'?1:0} value={draft[key]||0} onChange={e=>setDraft({...draft,[key]:Number(e.target.value)})}/></label>)}<label>Transmission<CrmSelect label="Transmission" value={draft.transmission} onChange={v=>setDraft({...draft,transmission:v})} options={[{value:"Manuelle",label:"Manuelle"},{value:"Automatique",label:"Automatique"}]}/></label><label className="crm-ext-check"><input type="checkbox" checked={draft.available} onChange={e=>setDraft({...draft,available:e.target.checked})}/> Visible sur le site</label><label className="crm-ext-check"><input type="checkbox" checked={draft.featured} onChange={e=>setDraft({...draft,featured:e.target.checked})}/> Mise en avant</label></div><MultiField label="Description du véhicule · FR / EN / AR" multiline value={draft.descriptions||empty} onChange={v=>setDraft({...draft,descriptions:v})}/><h3>Photographies ({draft.images?.length||0}/6)</h3><div className="crm-ext-photos">{(draft.images||[]).map((src,i)=><div key={src}><img src={src} alt={`Photo ${i+1}`}/><small>{i===0?'Couverture':`Photo ${i+1}`}</small><div><button type="button" disabled={i===0} onClick={()=>setDraft({...draft,images:[src,...draft.images.filter(x=>x!==src)]})}>Couverture</button><button type="button" onClick={()=>setDraft({...draft,images:draft.images.filter(x=>x!==src)})}>Retirer</button></div></div>)}</div><label className="crm-ext-upload"><Upload size={18}/> Ajouter des photos<input type="file" accept="image/png,image/jpeg,image/webp" multiple disabled={busy||draft.images?.length>=6} onChange={async e=>{const input=e.currentTarget;const files=Array.from(input.files||[]).slice(0,Math.max(0,6-(draft.images||[]).length));input.value='';for(const file of files){await upload(file)}}}/></label><ErrorBox message={error}/><footer className="crm-ext-actions"><Action onClick={()=>onClose()}>Annuler</Action><button className="crm-button crm-button-primary" disabled={busy} onClick={save}><Save size={16}/> Enregistrer</button></footer></div></div>;
}
export function DeleteCarDialog({car,onClose,onDeleted,onError}:{car:Car|null;onClose:()=>void;onDeleted:()=>Promise<void>;onError:(message:string)=>void}){
 const [busy,setBusy]=useState(false);
 async function remove(){if(!car)return;setBusy(true);try{await api(`/api/admin/cars/${car.id}`,'DELETE');await onDeleted()}catch(e){onError((e as Error).message)}finally{setBusy(false);onClose()}}
 return <ConfirmDialog open={!!car} title="Supprimer ce véhicule ?" description={`Le véhicule ${car?.name||''} sera supprimé du catalogue. Un véhicule ayant des réservations ne peut pas être supprimé.`} destructive confirmLabel="Supprimer le véhicule" busy={busy} onCancel={onClose} onConfirm={()=>void remove()}/>
}

export function ContentModule(){
 const [cms,setCms]=useState<Cms|null>(null),[kind,setKind]=useState<Kind>('faq'),[editing,setEditing]=useState<Item|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(true),[confirmAction,setConfirmAction]=useState<{type:'delete'|'restore';id:string}|null>(null);
 const load=useCallback(async()=>{setBusy(true);try{setCms((await api<{cms:Cms}>('/api/admin/content')).cms);setError('')}catch(e){setError((e as Error).message)}finally{setBusy(false)}},[]);useEffect(()=>{void load()},[load]);
 function start(item?:Item){setEditing(item?structuredClone(item):{id:'',off:false,q:{...empty},a:{...empty},t:{...empty},b:{...empty},n:'',r:5});setError('')}
 async function save(){if(!editing)return;try{const payload=editing;await api(`/api/admin/content/${kind}${editing.id?'/'+editing.id:''}`,editing.id?'PATCH':'POST',payload);setEditing(null);await load()}catch(e){setError((e as Error).message)}}
 async function change(item:Item,action:'toggle'|'delete'|'up'|'down'){if(!cms)return;try{if(action==='delete'){await api(`/api/admin/content/${kind}/${item.id}`,'DELETE')}else if(action==='toggle')await api(`/api/admin/content/${kind}/${item.id}`,'PATCH',{off:!item.off});else{const a=[...cms[kind]],i=a.findIndex(x=>x.id===item.id),j=i+(action==='up'?-1:1);if(j<0||j>=a.length)return;[a[i],a[j]]=[a[j],a[i]];await api(`/api/admin/content/${kind}/order`,'PATCH',{ids:a.map(x=>x.id)})}await load()}catch(e){setError((e as Error).message)}}
 async function restore(id:string){try{await api(`/api/admin/content/terms/restore/${id}`,'POST',{});await load()}catch(e){setError((e as Error).message)}}
 return <section className="crm-panel crm-ext-panel"><div className="crm-ext-head"><h2>Gestion de contenu · FR / EN / AR</h2><button className="crm-button crm-button-primary" onClick={()=>start()}><Plus size={16}/> Ajouter</button></div><div className="crm-ext-tabs">{kinds.map(k=><button key={k.key} className={kind===k.key?'active':''} onClick={()=>{setKind(k.key);setEditing(null)}}>{k.name}</button>)}</div><ErrorBox message={error}/><BusyState busy={busy}/>{cms?.[kind].map(item=><div className="crm-ext-listline" key={item.id}><div><strong>{translated(item.q||item.t)} {kind==='tes'&&`· ${item.n} · ${item.r}/5`}</strong><small>{translated(item.a||item.b||item.t).slice(0,110)} {item.off?'· Masqué':''}</small></div><div className="crm-ext-actions"><Action onClick={()=>change(item,'up')}>↑</Action><Action onClick={()=>change(item,'down')}>↓</Action><Action onClick={()=>start(item)}>Modifier</Action><Action onClick={()=>change(item,'toggle')}>{item.off?'Afficher':'Masquer'}</Action><Action destructive onClick={()=>setConfirmAction({type:'delete',id:item.id})}><Trash2 size={14}/></Action></div></div>)}{cms&&!cms[kind].length&&<CrmEmpty title="Aucun contenu publié" description="Ajoutez un élément pour alimenter cette section du site." action={<button className="crm-button crm-button-primary" onClick={()=>start()}><Plus size={16}/> Ajouter un contenu</button>}/>}{editing&&<div className="crm-modal-overlay"><div className="crm-modal crm-ext-modal"><header className="crm-ext-head"><h2>{editing.id?'Modifier':'Ajouter'} · {kinds.find(x=>x.key===kind)?.name}</h2><button className="crm-icon-close" aria-label="Fermer" onClick={()=>setEditing(null)}><X size={19}/></button></header>{kind==='faq'&&<><MultiField label="Question" value={editing.q||empty} onChange={v=>setEditing({...editing,q:v})}/><MultiField label="Réponse" multiline value={editing.a||empty} onChange={v=>setEditing({...editing,a:v})}/></>}{kind==='terms'&&<><MultiField label="Titre de section" value={editing.t||empty} onChange={v=>setEditing({...editing,t:v})}/><MultiField label="Conditions" multiline value={editing.b||empty} onChange={v=>setEditing({...editing,b:v})}/></>}{kind==='tes'&&<><div className="crm-ext-form"><label>Nom du client<input value={editing.n||''} onChange={e=>setEditing({...editing,n:e.target.value})}/></label><label>Note<CrmSelect label="Note" value={String(editing.r||5)} onChange={v=>setEditing({...editing,r:Number(v)})} options={[5,4,3,2,1].map(x=>({value:String(x),label:`${x} / 5`}))}/></label></div><MultiField label="Témoignage" multiline value={editing.t||empty} onChange={v=>setEditing({...editing,t:v})}/></>}<ErrorBox message={error}/><footer className="crm-ext-actions"><Action onClick={()=>setEditing(null)}>Annuler</Action><button className="crm-button crm-button-primary" onClick={save}><Save size={17}/> Enregistrer</button></footer></div></div>}<ConfirmDialog open={!!confirmAction} title={confirmAction?.type==='delete'?'Supprimer ce contenu ?':'Restaurer ces conditions ?'} description={confirmAction?.type==='delete'?'Ce contenu sera supprimé définitivement.':'La restauration créera une nouvelle version publiée des conditions.'} destructive={confirmAction?.type==='delete'} confirmLabel={confirmAction?.type==='delete'?'Supprimer':'Restaurer la version'} onCancel={()=>setConfirmAction(null)} onConfirm={()=>{if(!confirmAction)return;const action=confirmAction;setConfirmAction(null);if(action.type==='delete'){const item=cms?.[kind].find(x=>x.id===action.id);if(item)void change(item,'delete')}else void restore(action.id)}}/></section>
}
export function SiteSettingsModule(){
 const router=useRouter();
 const [site,setSite]=useState<Site|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(true),[keySearch,setKeySearch]=useState(''),[saved,setSaved]=useState(false);
 useEffect(()=>{void api<{site:Site}>('/api/admin/settings').then(r=>setSite(r.site)).catch(e=>setError(e.message)).finally(()=>setBusy(false))},[]);
 const setContact=(key:keyof Site['contact'],value:string)=>{setSaved(false);setSite(p=>p?{...p,contact:{...p.contact,[key]:value}}:p)};
 async function save(){if(!site)return;setBusy(true);try{await api('/api/admin/settings','PATCH',site);setError('');setSaved(true);router.refresh();window.dispatchEvent(new Event('chawki-site-updated'));}catch(e){setError((e as Error).message)}finally{setBusy(false)}}
 return <div className="crm-ext-grid"><section className="crm-panel crm-ext-panel"><h2>Coordonnées & identité</h2><BusyState busy={busy}/>{site&&<div className="crm-ext-form">{([['phone','Téléphone'],['whatsapp','WhatsApp (chiffres)'],['email','Email'],['tiktok','TikTok HTTPS'],['map','Google Maps HTTPS'],['mapEmbed','Lien carte intégrée'],['copyright','Copyright']] as [keyof Site['contact'],string][]).map(([key,label])=><label key={key}>{label}<input value={site.contact[key]||''} onChange={e=>setContact(key,e.target.value)}/></label>)}</div>}</section><section className="crm-panel crm-ext-panel"><h2>Apparence & sections</h2>{site&&<div className="crm-ext-form"><label>Couleur principale<input type="color" value={site.appearance.accent} onChange={e=>{setSaved(false);setSite({...site,appearance:{...site.appearance,accent:e.target.value}})}}/></label><label>Thème par défaut<CrmSelect label="Thème par défaut" value={site.appearance.mode} onChange={v=>{setSaved(false);setSite({...site,appearance:{...site.appearance,mode:v}})}} options={[{value:"auto",label:"Système"},{value:"dark",label:"Sombre"},{value:"light",label:"Clair"}]}/></label><h3>Visibilité du site public</h3>{Object.entries(site.sections).map(([key,visible])=><label className="crm-ext-check" key={key}><input type="checkbox" checked={visible} onChange={e=>{setSaved(false);setSite({...site,sections:{...site.sections,[key]:e.target.checked}})}}/>{({features:'Avantages',fleet:'Flotte',steps:'Étapes',story:'Agence',reviews:'Avis',faq:'FAQ',airport:'Aéroport',cta:'Appel à action'} as Record<string,string>)[key]||key}</label>)}</div>}</section><section className="crm-ext-savebar"><div className="crm-ext-save-status"><ErrorBox message={error}/>{saved&&<span role="status">✓ Paramètres enregistrés. Actualisez le site public pour voir les changements.</span>}</div><button className="crm-button crm-button-primary" disabled={busy||!site} onClick={save}><Save size={16}/> Enregistrer les paramètres</button></section></div>
}
export function ClearActivity({onUpdated}:{onUpdated:()=>Promise<void>}){const [error,setError]=useState(''),[open,setOpen]=useState(false),[busy,setBusy]=useState(false);async function clear(){setBusy(true);try{await api('/api/admin/activity','DELETE');await onUpdated();setOpen(false);setError('')}catch(e){setError((e as Error).message)}finally{setBusy(false)}}return <div className="crm-danger-zone"><div><strong>Maintenance du journal</strong><p>Les entrées du journal servent au suivi interne. Leur suppression est définitive.</p></div><Action destructive onClick={()=>setOpen(true)}><Trash2 size={16}/> Vider le journal</Action><ErrorBox message={error}/><ConfirmDialog open={open} title="Effacer le journal d'activité ?" description="Toutes les entrées d'activité seront supprimées. Cette action ne peut pas être annulée et ne supprime pas les réservations." confirmLabel="Effacer définitivement" destructive busy={busy} onCancel={()=>setOpen(false)} onConfirm={()=>void clear()}/></div>}
export function DeleteMessage({id,onUpdated}:{id:string;onUpdated:()=>Promise<void>}){const [error,setError]=useState(''),[open,setOpen]=useState(false),[busy,setBusy]=useState(false);async function remove(){setBusy(true);try{await api(`/api/admin/messages/${id}`,'DELETE');await onUpdated();setOpen(false)}catch(e){setError((e as Error).message)}finally{setBusy(false)}}return <><Action destructive onClick={()=>setOpen(true)}><Trash2 size={15}/> Supprimer</Action><ErrorBox message={error}/><ConfirmDialog open={open} title="Supprimer le message ?" description="Ce message sera supprimé définitivement de la messagerie." confirmLabel="Supprimer" destructive busy={busy} onCancel={()=>setOpen(false)} onConfirm={()=>void remove()}/></>}
