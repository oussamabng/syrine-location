"use client";

import {createContext,useCallback,useContext,useEffect,useMemo,useState} from "react";
import {usePathname,useRouter} from "next/navigation";
import {request,labels,tabHref} from "./admin-ui";
import type {User,Reservation,Message,Car,Customer,Event,Tab,Status} from "./admin-ui";

function useAdminState(){
 const router=useRouter(),pathname=usePathname();
 const [auth,setAuth]=useState<boolean|null>(null),[user,setUser]=useState<User|null>(null);
 const [username,setUsername]=useState("admin"),[password,setPassword]=useState(""),[showPassword,setShowPassword]=useState(false);
 const [busy,setBusy]=useState(false),[error,setError]=useState(""),[notice,setNotice]=useState("");
 const [search,setSearch]=useState("");
 const [filter,setFilter]=useState(pathname.startsWith("/admin/reservations")?"pending":"all"),[selected,setSelected]=useState<Reservation|null>(null);
 const [bookings,setBookings]=useState<Reservation[]>([]),[messages,setMessages]=useState<Message[]>([]),[cars,setCars]=useState<Car[]>([]);
 const [customers,setCustomers]=useState<Customer[]>([]),[activity,setActivity]=useState<Event[]>([]),[users,setUsers]=useState<User[]>([]);
 const [createCar,setCreateCar]=useState(false),[createUser,setCreateUser]=useState(false);
 const [resetFor,setResetFor]=useState<User|null>(null),[resetValue,setResetValue]=useState("");
 const [userForm,setUserForm]=useState({username:"",password:"",role:"agent"});
 const [carForm,setCarForm]=useState({name:"",year:"2026",color:"Gris",transmission:"Manuelle",dailyPrice:"",dailyPriceEur:"",category:"Citadine"});
 const load=useCallback(async(role?:string)=>{
   const [br,mr,cr,cu,ac]=await Promise.all([
     request<{bookings:Reservation[]}>("/api/admin/reservations"),request<{messages:Message[]}>("/api/admin/messages"),
     request<{cars:Car[]}>("/api/admin/cars"),request<{customers:Customer[]}>("/api/admin/customers"),
     request<{activity:Event[]}>("/api/admin/activity")
   ]);
   setBookings(br.bookings);setMessages(mr.messages);setCars(cr.cars);setCustomers(cu.customers);setActivity(ac.activity);
   if(role==="admin")setUsers((await request<{users:User[]}>("/api/admin/users")).users);
 },[]);
 useEffect(()=>{let alive=true;request<{authenticated:boolean;user:User|null}>("/api/admin/me").then(async me=>{
   if(!alive)return;setAuth(me.authenticated);setUser(me.user);if(me.authenticated)await load(me.user?.role);
 }).catch(e=>{if(alive){setAuth(false);setError(e.message)}});return()=>{alive=false}},[load]);
 const refresh=useCallback(async()=>{setError("");try{await load(user?.role);setNotice("Données actualisées") }catch(e){setError((e as Error).message)}},[load,user]);
 async function login(e:React.FormEvent){e.preventDefault();setBusy(true);setError("");try{
  const r=await request<{user:User}>("/api/admin/login","POST",{username,password});setUser(r.user);setAuth(true);setPassword("");router.replace("/admin");await load(r.user.role);
 }catch(e){setError((e as Error).message)}finally{setBusy(false)}}
 async function logout(){await request("/api/admin/logout","POST",{}).catch(()=>{});setAuth(false);setUser(null);setBookings([]);setUsers([]);setSelected(null);router.replace("/admin")}
 async function changeBooking(record:Reservation,status:Status){setBusy(true);setError("");try{
   await request(`/api/admin/reservations/${record.id}`,"PATCH",{status});setSelected(record?{...record,status}:null);setNotice(`Demande ${record.reference} : ${labels[status].toLowerCase()}`);await load(user?.role);
 }catch(e){setError((e as Error).message)}finally{setBusy(false)}}
 async function changeMessage(record:Message,status:string){setBusy(true);try{await request(`/api/admin/messages/${record.id}`,"PATCH",{status});await load(user?.role)}catch(e){setError((e as Error).message)}finally{setBusy(false)}}
 async function updateCar(car:Car,changes:Partial<Car>){setBusy(true);setError("");try{
   await request(`/api/admin/cars/${car.id}`,"PATCH",changes);setNotice("Véhicule mis à jour");await load(user?.role);
 }catch(e){setError((e as Error).message)}finally{setBusy(false)}}
 async function saveCar(e:React.FormEvent){e.preventDefault();setBusy(true);setError("");try{
   await request('/api/admin/cars','POST',{...carForm,year:Number(carForm.year),dailyPrice:Number(carForm.dailyPrice),dailyPriceEur:Number(carForm.dailyPriceEur)});
   setCreateCar(false);setNotice("Véhicule ajouté");await load(user?.role);
 }catch(e){setError((e as Error).message)}finally{setBusy(false)}}
 async function saveUser(e:React.FormEvent){e.preventDefault();setBusy(true);setError("");try{
   await request('/api/admin/users','POST',userForm);setCreateUser(false);setUserForm({username:"",password:"",role:"agent"});setNotice("Compte créé");await load(user?.role);
 }catch(e){setError((e as Error).message)}finally{setBusy(false)}}
 async function resetPassword(e:React.FormEvent){e.preventDefault();if(!resetFor)return;setBusy(true);try{await request(`/api/admin/users/${resetFor.id}`,'PATCH',{password:resetValue});setNotice(`Mot de passe modifié pour ${resetFor.username}`);setResetFor(null);setResetValue("");if(resetFor.id===user?.id){await logout();return}await load(user?.role)}catch(e){setError((e as Error).message)}finally{setBusy(false)}}
 async function toggleUser(account:User){setBusy(true);try{await request(`/api/admin/users/${account.id}`,'PATCH',{active:!account.active});await load(user?.role)}catch(e){setError((e as Error).message)}finally{setBusy(false)}}
 useEffect(()=>{setSearch("");setFilter(pathname.startsWith("/admin/reservations")?"pending":"all");setError("")},[pathname]);
 const selectTab=(next:Tab)=>router.push(tabHref(next));
 const pending=bookings.filter(b=>b.status==="pending").length;
 const confirmed=bookings.filter(b=>b.status==="confirmed").length;
 const unread=messages.filter(m=>m.status!=="read").length;
 const estimate=bookings.filter(b=>["confirmed","completed"].includes(b.status)).reduce((a,b)=>a+(b.totalEstimate||0),0);
 const matches=(...values:(string|number|undefined)[])=>values.some(v=>String(v??"").toLowerCase().includes(search.toLowerCase()));
 const filteredBookings=bookings.filter(b=>(filter==="all"||b.status===filter)&&matches(b.reference,b.fullName,b.phone,b.carName));
 const filteredMessages=messages.filter(m=>(filter==="all"||m.status===filter)&&matches(m.fullName,m.reply,m.subject,m.message));
 const filteredCars=cars.filter(c=>matches(c.name,c.year,c.color,c.transmission));
 const filteredCustomers=customers.filter(c=>matches(c.fullName,c.phone,c.email));
 const bars=useMemo(()=>Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-6+i);const key=d.toISOString().slice(0,10);return {key,label:d.toLocaleDateString("fr-DZ",{weekday:"short"}),count:bookings.filter(b=>b.createdAt.slice(0,10)===key).length}}),[bookings]);
 const maxBar=Math.max(...bars.map(b=>b.count),1);
 return {auth,user,username,setUsername,password,setPassword,showPassword,setShowPassword,busy,error,setError,notice,setNotice,search,setSearch,filter,setFilter,selected,setSelected,bookings,messages,cars,customers,activity,users,createCar,setCreateCar,createUser,setCreateUser,resetFor,setResetFor,resetValue,setResetValue,userForm,setUserForm,carForm,setCarForm,load,refresh,login,logout,changeBooking,changeMessage,updateCar,saveCar,saveUser,resetPassword,toggleUser,pending,confirmed,unread,estimate,filteredBookings,filteredMessages,filteredCars,filteredCustomers,bars,maxBar,selectTab};
}
export type AdminState=ReturnType<typeof useAdminState>;
const AdminContext=createContext<AdminState|null>(null);
export function AdminProvider({children}:{children:React.ReactNode}){const value=useAdminState();return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>}
export function useAdmin(){const value=useContext(AdminContext);if(!value)throw new Error("useAdmin must be used inside <AdminProvider>");return value}
