"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CalendarDays } from "lucide-react";
import { rentalDays } from "@/lib/data";
import { Tr, useLocale } from "@/lib/i18n";
import { DateField } from "@/components/ui-fields";

const todayIso = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

export function DateSearch() {
  const { t } = useLocale();
  const router = useRouter();
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [error, setError] = useState("");

  function go(event: React.FormEvent) {
    event.preventDefault();
    if (Boolean(start) !== Boolean(end)) {
      setError(t("Indiquez les deux dates ou laissez-les vides."));
      return;
    }
    if (start && end && rentalDays(start, end) < 5) {
      setError(t("La durée minimum de location est de 5 jours."));
      return;
    }
    setError("");
    try { sessionStorage.setItem("chawki-demo-dates", JSON.stringify({ start, end })); } catch {}
    router.push(`/vehicules${start && end ? `?debut=${start}&fin=${end}` : ""}`);
  }

  return <form className="date-search" onSubmit={go}>
    <div className="date-search-heading">
      <span className="date-search-icon"><CalendarDays size={21}/></span>
      <div><strong><Tr text="Prêt à prendre la route ?"/></strong><span><Tr text="Choisissez vos dates · disponibilité à confirmer."/></span></div>
    </div>
    <div className="date-search-fields">
      <div className="date-search-field"><span className="date-search-label"><Tr text="Départ"/></span>
        <DateField label={t("Date de départ")} value={start} min={todayIso()} onChange={date => {
          setStart(date); setError(""); if (end && date && date > end) setEnd("");
        }}/></div>
      <div className="date-search-field"><span className="date-search-label"><Tr text="Retour"/></span>
        <DateField label={t("Date de retour")} value={end} min={start || todayIso()} align="end" onChange={date => { setEnd(date); setError(""); }}/></div>
      <button className="button button-primary date-submit" type="submit"><Tr text="Voir les véhicules "/><ArrowRight size={18}/></button>
    </div>
    {error && <p className="form-error" role="alert">{error}</p>}
  </form>;
}
