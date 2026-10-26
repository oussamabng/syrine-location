"use client";
import { useLocale, type Locale } from "@/lib/i18n";
import { SelectField } from "@/components/ui-fields";

const languages: { code: Locale; label: string; native: string }[] = [
  { code: "fr", label: "Français", native: "FR" },
  { code: "en", label: "English", native: "EN" },
  { code: "ar", label: "العربية", native: "AR" }
];

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useLocale();
  return <div className="language-control" dir="ltr" title={t("Choisir la langue")}>
    <SelectField label={t("Choisir la langue")} className="header-language-select" value={locale} onChange={value=>setLocale(value as Locale)}
      options={languages.map(l=>({value:l.code,label:l.label}))}/>
  </div>;
}
