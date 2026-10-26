"use client";
import { useEffect, useRef, useState } from "react";
export function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
 const ref=useRef<HTMLDivElement>(null); const [shown,setShown]=useState(false);
 useEffect(()=>{if (window.matchMedia('(prefers-reduced-motion: reduce)').matches){setShown(true);return;}const el=ref.current;if(!el)return;const obs=new IntersectionObserver((entries)=>{if(entries[0].isIntersecting){setShown(true);obs.disconnect();}}, {threshold:0.09,rootMargin:'0px 0px -24px 0px'});obs.observe(el);return()=>obs.disconnect();},[]);
 return <div ref={ref} className={`reveal ${shown?"is-visible":""} ${className}`} style={{transitionDelay:`${delay}ms`}}>{children}</div>;
}
