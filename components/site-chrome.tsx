"use client";
import { usePathname } from "next/navigation";
import { Header } from "@/components/header";
import { MobileDock } from "@/components/mobile-dock";
import {RentalTracker} from "@/components/rental-tracker";
export function SiteChrome({children,footer}:{children:React.ReactNode;footer:React.ReactNode}) {
 const path=usePathname();const isAdmin=path.startsWith('/admin');
 return isAdmin?<main id="contenu" className="admin-main">{children}</main>:<><Header/><main id="contenu">{children}</main>{footer}<MobileDock/><RentalTracker/></>;
}
