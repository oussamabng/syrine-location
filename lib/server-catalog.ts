import {getReadonlyData} from "@/lib/server-store";
import { vehicles, type Vehicle } from "@/lib/data";

type ApiCar = {
 id:string; name:string; year:number; color:string; transmission:"Automatique"|"Manuelle";
 dailyPrice:number; dailyPriceEur:number; category:string; seats:number; featured:boolean;
 available:boolean; images:string[];
};
/** Reads the same JSON database as the old local API without depending on a network request at build time. */
export function getSiteVehicles(): Vehicle[] {
 try {
  const parsed=getReadonlyData() as {cars?:ApiCar[]};
  if(!Array.isArray(parsed.cars)) return vehicles;
  return parsed.cars.filter(v=>v.available).map(c=>{
   const previous=vehicles.find(v=>v.slug===c.id);
   return {
     ...(previous||{brand:c.name.split(" ")[0],luggage:2}),
     slug:c.id,name:c.name,year:c.year,color:c.color,
     transmission:c.transmission,priceDzd:c.dailyPrice,priceEur:c.dailyPriceEur,
     photo:c.images?.[0]||previous?.photo||"/cars/geely-coolray-2025.webp",
     images:c.images?.length?c.images:previous?.images,
     category:(["SUV","Citadine","Berline","Compacte"].includes(c.category)?c.category:"Compacte") as Vehicle["category"],
     seats:c.seats,featured:c.featured,descriptions:(c as ApiCar & {descriptions?:{fr?:string;en?:string;ar?:string}}).descriptions
   };
  });
 }catch {return vehicles;}
}
