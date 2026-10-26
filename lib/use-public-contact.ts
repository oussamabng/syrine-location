"use client";
import {useEffect,useState} from 'react';
import {contact} from './data';
export function useWhatsAppNumber(){const [number,setNumber]=useState(contact.whatsapp);useEffect(()=>{let live=true;fetch('/api/public/site',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(data=>{const next=data?.site?.contact?.whatsapp;if(live&&/^\d{8,15}$/.test(next))setNumber(next)}).catch(()=>{});return()=>{live=false}},[]);return number}
export function whatsappUrl(number:string,message:string){return `https://wa.me/${number}?text=${encodeURIComponent(message)}`}

export function usePublicPhone(){const [number,setNumber]=useState(contact.phoneDial);useEffect(()=>{let live=true;fetch('/api/public/site',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(data=>{const next=data?.site?.contact?.phone;if(live&&typeof next==='string'&&/^[+\d\s()-]{8,25}$/.test(next))setNumber(next)}).catch(()=>{});return()=>{live=false}},[]);return number}
