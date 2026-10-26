"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ArrowUpRight, Menu, X, Phone, LockKeyhole, UserRound } from "lucide-react";
import { Brand } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useLocale } from "@/lib/i18n";
import { contact } from "@/lib/data";
import {usePublicPhone} from "@/lib/use-public-contact";

const links = [{ href: "/", label: "Accueil" }, { href: "/vehicules", label: "Véhicules" }, { href: "/conditions", label: "Conditions" }, { href: "/contact", label: "Contact" }];
export function Header() {
  const pathname = usePathname();
  const publicPhone = usePublicPhone();
  const [open, setOpen] = useState(false);
  const { t } = useLocale();
  return <header className="site-header">
    <div className="header-inner container-wide">
      <Brand />
      <nav className="desktop-nav" aria-label={t("Navigation principale")}>{links.map((l) => <Link key={l.href} href={l.href} className={`nav-link ${pathname === l.href || (l.href === "/vehicules" && pathname.startsWith("/vehicules/")) ? "active" : ""}`}>{t(l.label)}</Link>)}</nav>
      <div className="header-actions">
        <a className="header-contact header-icon-action" href={`tel:${publicPhone.replace(/[^+\d]/g,"")}`} aria-label={t("Nous appeler")} title={t("Nous appeler")}><Phone size={19} strokeWidth={1.9} aria-hidden="true" /></a>
        <LanguageSwitcher />
        <ThemeToggle />
        <Link href="/admin" className="admin-navbar-link header-icon-action" aria-label={t("Connexion admin")} title={t("Connexion admin")}><UserRound size={19} strokeWidth={1.9} aria-hidden="true" /></Link>
        <button className="menu-trigger" type="button" aria-label={t(open ? "Fermer le menu" : "Ouvrir le menu")} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X size={23} /> : <Menu size={23} />}</button>
      </div>
    </div>
    {open && <nav className="mobile-nav" aria-label={t("Navigation mobile")}>{links.map((l) => <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className={pathname === l.href ? "active" : ""}>{t(l.label)}<ArrowUpRight size={18}/></Link>)}<Link href="/admin" onClick={() => setOpen(false)}><LockKeyhole size={17}/> {t("Connexion admin")}</Link><a href={`tel:${publicPhone.replace(/[^+\d]/g,"")}`}><Phone size={17}/> {publicPhone}</a></nav>}
  </header>;
}
