import type {Metadata} from "next";
import "./admin.css";
import {AdminProvider} from "./admin-context";
import {AdminShell} from "./admin-shell";

export const metadata: Metadata = {title: "Administration", robots: {index: false, follow: false}};

export default function AdminLayout({children}: {children: React.ReactNode}) {
  return <AdminProvider><AdminShell>{children}</AdminShell></AdminProvider>;
}
