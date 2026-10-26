"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { en, ar } from "@/lib/translations";
import {usePathname} from "next/navigation";

export type Locale = "fr" | "en" | "ar";
const KEY = "chawki-language";
const dictionaries: Record<Exclude<Locale, "fr">, Record<string, string>> = { en, ar };

function valid(value: string | null): Locale {
  return value === "en" || value === "ar" ? value : "fr";
}

function applyLanguage(locale: Locale) {
  document.documentElement.lang = locale;
  document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  document.documentElement.dataset.locale = locale;
}

interface LocaleContextValue { locale: Locale; setLocale: (locale: Locale) => void; t: (french: string) => string; }
const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [locale, setLocaleState] = useState<Locale>("fr");
  const [overrides,setOverrides]=useState<Record<string,Record<Locale,string>>>({});
  useEffect(() => {
    // Root layout's inline script has already set lang/dir, before the first paint.
    const language = valid(document.documentElement.lang);
    setLocaleState(language);
    applyLanguage(language);
  }, []);
  useEffect(()=>{let live=true;const update=()=>{fetch('/api/public/site',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(data=>{if(live&&data?.site?.copy)setOverrides(data.site.copy)}).catch(()=>{})};update();window.addEventListener('chawki-site-updated',update);return()=>{live=false;window.removeEventListener('chawki-site-updated',update)}},[pathname]);
  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    applyLanguage(next);
    try { localStorage.setItem(KEY, next); } catch { /* Storage may be disabled. */ }
  }, []);
  const t = useCallback((french: string): string => {
    const custom=overrides[french]||overrides[french.trim()];
    if(custom?.[locale])return custom[locale];
    if (locale === "fr") return french;
    const dictionary = dictionaries[locale];
    const trimmed = french.trim();
    const translated = dictionary[french] ?? dictionary[trimmed] ?? dictionary[trimmed + " "] ?? dictionary[" " + trimmed] ?? dictionary[" " + trimmed + " "];
    if (translated === undefined) return french;
    if (dictionary[french] !== undefined) return translated;
    const leading = french.match(/^\s*/)?.[0] ?? "";
    const trailing = french.match(/\s*$/)?.[0] ?? "";
    return leading + translated + (translated.endsWith(" ") ? "" : trailing);
  }, [locale,overrides]);
  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const value = useContext(LocaleContext);
  if (!value) throw new Error("useLocale requires LocaleProvider");
  return value;
}

/** Inline, context-aware translation; usable from server and client page trees. */
export function Tr({ text }: { text: string }) {
  const { t } = useLocale();
  return <>{t(text)}</>;
}
