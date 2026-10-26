"use client";
import { Tr } from "@/lib/i18n";
import { SelectField } from "@/components/ui-fields";
import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, ArrowDownUp, X, CarFront } from "lucide-react";
import type { Vehicle } from "@/lib/data";
import { VehicleCard } from "@/components/vehicle-card";
import { useLocale } from "@/lib/i18n";
const categories = ["Toutes", "SUV", "Citadine", "Berline", "Compacte"] as const;
export function VehicleFilters({initialVehicles: vehicles}:{initialVehicles:Vehicle[]}) {
 const { t } = useLocale();
 const [chosenDates,setChosenDates]=useState<{start:string;end:string}|null>(null);
 useEffect(()=>{try{const raw=sessionStorage.getItem("chawki-demo-dates");if(raw){const obj=JSON.parse(raw);if(obj.start&&obj.end)setChosenDates(obj);}}catch{}},[]);
 const [q,setQ]=useState("");const [category,setCategory]=useState<string>("Toutes");const [gear,setGear]=useState("Toutes");const [sort,setSort]=useState("popular");
 const filtered=useMemo(()=>{let v=vehicles.filter(c=>(category==="Toutes"||c.category===category)&&(gear==="Toutes"||c.transmission===gear)&&`${c.name} ${c.brand} ${c.year} ${c.color} ${t(c.color)} ${t(c.category)} ${t(c.transmission)}`.toLowerCase().includes(q.toLowerCase().trim()));if(sort==="cheap") v.sort((a,b)=>a.priceDzd-b.priceDzd);if(sort==="expensive")v.sort((a,b)=>b.priceDzd-a.priceDzd);if(sort==="recent")v.sort((a,b)=>b.year-a.year);return v;},[q,category,gear,sort,t]);
 return <>
   {chosenDates&&<div className="chosen-dates-note"><span><Tr text="Dates demandées : "/><strong>{chosenDates.start} → {chosenDates.end}</strong></span><span><Tr text={"Ces dates ne filtrent pas une disponibilité réelle. Vérifiez auprès de l’agence."}/></span><button type="button" onClick={()=>{sessionStorage.removeItem("chawki-demo-dates");setChosenDates(null);}} aria-label={t("Effacer les dates")}><X size={15}/></button></div>}
   <div className="filters-panel"><div className="filter-head"><span><SlidersHorizontal size={17}/><Tr text={" Affiner votre recherche"}/></span><small>{filtered.length}<Tr text=" véhicules"/></small></div>
    <div className="filters-main"><label className="search-input"><Search size={20}/><input placeholder={t("Marque, modèle...")} value={q} onChange={e=>setQ(e.target.value)} aria-label={t("Rechercher une voiture")}/>{q&&<button type="button" aria-label={t("Effacer la recherche")} onClick={()=>setQ("")}><X size={17}/></button>}</label>
    <div className="select-field"><span><Tr text="Boîte de vitesses"/></span>
      <SelectField label={t("Boîte de vitesses")} value={gear} onChange={setGear}
        options={["Toutes","Automatique","Manuelle"].map(item=>({value:item,label:t(item)}))}/>
    </div>
    <div className="select-field sort-select"><span><ArrowDownUp size={14}/><Tr text=" Trier par"/></span>
      <SelectField label={t("Trier les véhicules")} value={sort} onChange={setSort}
        options={[
          {value:"popular",label:t("Notre sélection")},
          {value:"cheap",label:t("Prix croissant")},
          {value:"expensive",label:t("Prix décroissant")},
          {value:"recent",label:t("Plus récents")}
        ]}/>
    </div></div>
    <div className="category-chips">{categories.map(cat=><button key={cat} type="button" onClick={()=>setCategory(cat)} className={`category-chip ${category===cat?"active":""}`}><Tr text={cat}/></button>)}</div></div>
   {filtered.length?<div className="vehicles-grid">{filtered.map((v,i)=><VehicleCard key={v.slug} vehicle={v} index={i}/>)}</div>:<div className="empty-state"><CarFront size={36}/><h3><Tr text={"Aucun véhicule trouvé"}/></h3><p><Tr text={"Essayez d’élargir vos filtres pour afficher d’autres modèles."}/></p><button className="button button-primary" onClick={()=>{setQ("");setCategory("Toutes");setGear("Toutes");setSort("popular");}}><Tr text={"Réinitialiser les filtres"}/></button></div>}
 </>;
}
