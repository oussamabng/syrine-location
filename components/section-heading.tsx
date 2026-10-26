import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Tr } from "@/lib/i18n";
export function SectionHeading({ eyebrow, title, description, link, linkLabel }: { eyebrow: string; title: React.ReactNode; description?: string; link?: string; linkLabel?: string }) {
 return <div className="section-heading"><div><span className="eyebrow"><span className="eyebrow-line" /><Tr text={eyebrow}/></span><h2>{title}</h2>{description&&<p><Tr text={description}/></p>}</div>{link&&<Link href={link} className="text-link"><Tr text={linkLabel??"Découvrir"}/><ArrowUpRight size={17}/></Link>}</div>;
}
