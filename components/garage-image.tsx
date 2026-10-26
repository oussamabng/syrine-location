"use client";
import { useState } from "react";
import { useLocale } from "@/lib/i18n";
const link="https://lh3.googleusercontent.com/gps-cs-s/ANWiy9SJgJoyFQACcrZHG7uk6g7WphymKKmoydS37Yt4tP6L-dGPp1QjhZDXx3aHxZ1FhbBBwyWySUsb3SM1Un7AlqJml3jGRalOUEgF2uODStYB5Kc2mNP61eFpDBwGN1SCWS1MEEdAuu4sRqg";
export function GarageImage(){const [fallback,setFallback]=useState(false);const [loaded,setLoaded]=useState(false);const {t}=useLocale();return <img className={`garage-img syrine-blur-image ${loaded ? "is-loaded" : ""}`} src={fallback?"/brand/garage-fallback.webp":link} alt={t("Devanture de l'agence Syrine à Bir El Djir, Oran")} loading="lazy" onLoad={()=>setLoaded(true)} onError={()=>{setLoaded(false);setFallback(true);}} />;}
