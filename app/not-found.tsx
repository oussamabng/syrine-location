import { Tr } from "@/lib/i18n";
import Link from "next/link";
import { ArrowLeft, CarFront } from "lucide-react";
export default function NotFound(){return <div className="not-found container-wide"><CarFront size={44}/><span><Tr text={"404 · La route s'arrête ici"}/></span><h1><Tr text={"Cette page n'existe pas."}/></h1><p><Tr text={"Reprenez le bon chemin et découvrez nos véhicules à Oran."}/></p><Link className="button button-primary" href="/"><ArrowLeft size={17}/><Tr text={" Retour à l'accueil"}/></Link></div>}
