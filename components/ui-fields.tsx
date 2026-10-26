"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight, Eye, EyeOff, X } from "lucide-react";
import { useLocale } from "@/lib/i18n";

type DateFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  required?: boolean;
  align?: "start" | "end";
  placeholder?: string;
};

type SelectChoice = { value: string; label: string };
type SelectFieldProps = {
  label: string;
  value: string;
  options: SelectChoice[];
  onChange: (value: string) => void;
  className?: string;
};

type TextFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "email" | "tel" | "password";
  autoComplete?: string;
  required?: boolean;
  inputMode?: "text" | "tel" | "email" | "numeric";
};

const pad = (num: number) => String(num).padStart(2, "0");
const iso = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const parse = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return value && year && month && day ? new Date(year, month - 1, day, 12) : null;
};
const atMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1, 12);
const localeTag = { fr: "fr-FR", en: "en-GB", ar: "ar-DZ" } as const;

function useDismiss(open: boolean, close: () => void, reference: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    if (!open) return;
    function pointerDown(event: PointerEvent) {
      if (!reference.current?.contains(event.target as Node)) close();
    }
    function escape(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }
    document.addEventListener("pointerdown", pointerDown);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", pointerDown);
      document.removeEventListener("keydown", escape);
    };
  }, [open, close, reference]);
}

/** Branded, locale-aware calendar. The stored value is always an ISO date (YYYY-MM-DD). */
export function DateField({ label, value, onChange, min, max, required, align = "start", placeholder }: DateFieldProps) {
  const { locale, t } = useLocale();
  const fieldId = useId();
  const wrapper = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [flip, setFlip] = useState(false);
  const [month, setMonth] = useState<Date>(() => atMonth(parse(value) || new Date()));
  const language = localeTag[locale];
  useDismiss(open, () => setOpen(false), wrapper);

  const selectedDate = parse(value);
  const today = iso(new Date());
  const earliest = min || "0000-01-01";
  const latest = max || "9999-12-31";
  const firstDay = (month.getDay() + 6) % 7; // Monday-first
  const dayCount = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const monthName = new Intl.DateTimeFormat(language, { month: "long", year: "numeric" }).format(month);
  const weekLabels = Array.from({ length: 7 }, (_, day) => {
    const date = new Date(2026, 0, 5 + day); // Jan 5 2026 was Monday
    return new Intl.DateTimeFormat(language, { weekday: "short" }).format(date);
  });
  const cells = [
    ...Array.from({ length: firstDay }, () => null),
    ...Array.from({ length: dayCount }, (_, index) => index + 1),
  ];
  while (cells.length % 7) cells.push(null);
  function showCalendar() {
    if (wrapper.current) setFlip(window.innerHeight - wrapper.current.getBoundingClientRect().bottom < 375);
    setMonth(atMonth(selectedDate || parse(min || "") || new Date()));
    setOpen(true);
  }
  function choose(day: number) {
    onChange(iso(new Date(month.getFullYear(), month.getMonth(), day, 12)));
    setOpen(false);
  }
  const displayed = selectedDate
    ? new Intl.DateTimeFormat(language, { day: "numeric", month: "short", year: "numeric" }).format(selectedDate)
    : (placeholder || t("Choisir une date"));
  const prevMonth = new Date(month.getFullYear(), month.getMonth() - 1, 1, 12);
  const nextMonth = new Date(month.getFullYear(), month.getMonth() + 1, 1, 12);
  const prevDisabled = iso(new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 0)) < earliest;
  const nextDisabled = iso(nextMonth) > latest;

  return <div ref={wrapper} className={`ui-date ui-popover-anchor ${open ? "is-open" : ""} ${flip ? "ui-open-up" : ""}`}>
    <button id={fieldId} type="button" className="ui-control ui-date-trigger" aria-haspopup="dialog" aria-expanded={open} aria-label={label} aria-required={required} onClick={() => open ? setOpen(false) : showCalendar()}>
      <CalendarDays size={18} aria-hidden="true" />
      <span className={value ? "" : "ui-placeholder"}>{displayed}</span>
      <ChevronDown size={16} className={`ui-control-chevron ${open ? "is-rotated" : ""}`} aria-hidden="true" />
    </button>
    {open && <div className={`ui-calendar ui-popover-${align}`} role="dialog" aria-modal="false" aria-label={label}>
      <div className="ui-calendar-heading">
        <button type="button" className="ui-calendar-nav" disabled={prevDisabled} onClick={() => setMonth(prevMonth)} aria-label={t("Mois précédent")}><ChevronLeft size={19}/></button>
        <strong>{monthName}</strong>
        <button type="button" className="ui-calendar-nav" disabled={nextDisabled} onClick={() => setMonth(nextMonth)} aria-label={t("Mois suivant")}><ChevronRight size={19}/></button>
      </div>
      <div className="ui-calendar-grid ui-calendar-weekdays">{weekLabels.map((weekday, index) => <span key={index}>{weekday}</span>)}</div>
      <div className="ui-calendar-grid" role="group" aria-label={monthName}>
        {cells.map((day, index) => {
          if (!day) return <span aria-hidden="true" key={`empty-${index}`} />;
          const date = iso(new Date(month.getFullYear(), month.getMonth(), day, 12));
          const disabled = date < earliest || date > latest;
          const full = new Intl.DateTimeFormat(language, { dateStyle: "full" }).format(new Date(month.getFullYear(), month.getMonth(), day, 12));
          return <button key={date} type="button" disabled={disabled} aria-label={full} aria-pressed={value === date}
            className={`ui-calendar-day ${today === date ? "is-today" : ""} ${value === date ? "is-selected" : ""}`}
            onClick={() => choose(day)}>{day}</button>;
        })}
      </div>
      <div className="ui-calendar-footer">
        <button type="button" onClick={() => { onChange(""); setOpen(false); }}><X size={14}/>{t("Effacer")}</button>
        {today >= earliest && today <= latest && <button type="button" onClick={() => { onChange(today); setOpen(false); }}>{t("Aujourd’hui")}</button>}
      </div>
    </div>}
  </div>;
}

/** Keyboard-operable custom select (no native select popup). */
export function SelectField({ label, value, onChange, options, className = "" }: SelectFieldProps) {
  const wrapper = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [flip, setFlip] = useState(false);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const { t } = useLocale();
  useDismiss(open, () => setOpen(false), wrapper);
  const activeIndex = Math.max(0, options.findIndex(item => item.value === value));
  function openAndFocus(index: number) {
    if (wrapper.current) setFlip(window.innerHeight - wrapper.current.getBoundingClientRect().bottom < 290);
    setOpen(true);
    requestAnimationFrame(() => optionRefs.current[Math.min(Math.max(index, 0), options.length - 1)]?.focus());
  }
  function choose(item: SelectChoice) {
    onChange(item.value);
    setOpen(false);
    wrapper.current?.querySelector<HTMLButtonElement>(".ui-select-trigger")?.focus();
  }
  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
        event.preventDefault();
        openAndFocus(activeIndex);
      }
      return;
    }
    const index = optionRefs.current.findIndex(element => element === document.activeElement);
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      optionRefs.current[(index + (event.key === "ArrowDown" ? 1 : -1) + options.length) % options.length]?.focus();
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      optionRefs.current[event.key === "Home" ? 0 : options.length - 1]?.focus();
    } else if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      wrapper.current?.querySelector<HTMLButtonElement>(".ui-select-trigger")?.focus();
    }
  }
  return <div className={`ui-select ui-popover-anchor ${open ? "is-open" : ""} ${flip ? "ui-open-up" : ""} ${className}`} ref={wrapper} onKeyDown={onKeyDown}>
    <button type="button" className="ui-control ui-select-trigger" aria-label={label} aria-haspopup="listbox" aria-expanded={open} onClick={() => open ? setOpen(false) : openAndFocus(activeIndex)}>
      <span>{options[activeIndex]?.label || t("Sélectionner")}</span>
      <ChevronDown size={17} className={`ui-control-chevron ${open ? "is-rotated" : ""}`} />
    </button>
    {open && <div role="listbox" aria-label={label} className="ui-select-menu">
      {options.map((item, index) => <button key={item.value} type="button" role="option" aria-selected={value === item.value} ref={element => { optionRefs.current[index] = element; }}
        className={`ui-select-option ${value === item.value ? "is-selected" : ""}`} onClick={() => choose(item)}>
        <span>{item.label}</span>{value === item.value && <Check size={16} />}
      </button>)}
    </div>}
  </div>;
}

/** Same branded control for text, email, telephone and optional password inputs. */
export function TextField({ label, value, onChange, placeholder, type = "text", autoComplete, required, inputMode }: TextFieldProps) {
  const [reveal, setReveal] = useState(false);
  const { t } = useLocale();
  const isPassword = type === "password";
  return <label className="form-field"><span>{label}</span><span className="ui-text-input">
    <input type={isPassword && reveal ? "text" : type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} autoComplete={autoComplete} required={required} inputMode={inputMode} />
    {isPassword && <button type="button" aria-label={t(reveal ? "Masquer le mot de passe" : "Afficher le mot de passe")} aria-pressed={reveal} onClick={() => setReveal(!reveal)}>
      {reveal ? <EyeOff size={18}/> : <Eye size={18}/>}</button>}
  </span></label>;
}

export function TextAreaField({ label, value, onChange, placeholder, required, rows = 5 }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; required?: boolean; rows?: number }) {
  return <label className="form-field"><span>{label}</span><textarea className="ui-textarea" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required} rows={rows}/></label>;
}
