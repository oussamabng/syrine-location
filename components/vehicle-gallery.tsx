"use client";

import { useCallback, useEffect, useRef, useState, type TouchEvent } from "react";
import { ChevronLeft, ChevronRight, Expand, X, Images } from "lucide-react";
import { BlurImage } from "@/components/blur-image";
import { useLocale } from "@/lib/i18n";

export function VehicleGallery({ photos, vehicleName }: { photos: string[]; vehicleName: string }) {
  const [active, setActive] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const expandButton = useRef<HTMLButtonElement>(null);
  const { t } = useLocale();
  const count = photos.length;
  const previous = useCallback(() => setActive((current) => (current - 1 + count) % count), [count]);
  const next = useCallback(() => setActive((current) => (current + 1) % count), [count]);

  useEffect(() => {
    if (!expanded) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExpanded(false);
      if (count > 1 && event.key === "ArrowLeft") (document.dir === "rtl" ? next : previous)();
      if (count > 1 && event.key === "ArrowRight") (document.dir === "rtl" ? previous : next)();
    };
    document.addEventListener("keydown", handleKeydown);
    closeButton.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeydown);
      expandButton.current?.focus();
    };
  }, [expanded, count, next, previous]);

  // Swiping on the main image and the expanded image changes the active photo.
  const swipeEvents = {
    onTouchStart: (event: TouchEvent) => setTouchStart(event.touches[0]?.clientX ?? null),
    onTouchEnd: (event: TouchEvent) => {
      if (touchStart === null || count < 2) return;
      const end = event.changedTouches[0]?.clientX ?? touchStart;
      const delta = end - touchStart;
      if (Math.abs(delta) > 45) {
        const rtl = document.dir === "rtl";
        (delta < 0 !== rtl ? next : previous)();
      }
      setTouchStart(null);
    },
  };

  const display = (large: boolean) => (
    <div className={`vehicle-gallery-main${large ? " vehicle-gallery-expanded-image" : ""}`} {...swipeEvents}>
      <BlurImage
        key={photos[active]}
        src={photos[active]}
        alt={`${vehicleName} — ${t("Photo")} ${active + 1} / ${count}`}
        fill
        priority={!large && active === 0}
        sizes={large ? "100vw" : "(max-width: 900px) 100vw, 58vw"}
      />
      {!large && <span className="vehicle-gallery-source">{t("Photo du catalogue Syrine")}</span>}
      <span className="vehicle-gallery-count" aria-live="polite">{active + 1} / {count}</span>
      {count > 1 && <>
        <button type="button" className="vehicle-gallery-arrow vehicle-gallery-prev" aria-label={t("Photo précédente")} onClick={previous}><ChevronLeft size={22}/></button>
        <button type="button" className="vehicle-gallery-arrow vehicle-gallery-next" aria-label={t("Photo suivante")} onClick={next}><ChevronRight size={22}/></button>
      </>}
      {!large && <button type="button" ref={expandButton} className="vehicle-gallery-zoom" aria-label={t("Agrandir la photo")} onClick={() => setExpanded(true)}><Expand size={18}/></button>}
    </div>
  );

  if (count === 0) return null;

  return <div className="vehicle-gallery" aria-label={`${t("Photos du véhicule")} ${vehicleName}`}>
    {display(false)}
    <div className="vehicle-gallery-bottom">
      <div className="vehicle-gallery-caption"><Images size={17}/><span>{t("Photos du véhicule")}</span><small>{count} {count === 1 ? t("photo") : t("photos")}</small></div>
      {count > 1 && <div className="vehicle-gallery-thumbs" role="group" aria-label={t("Choisir une photo")}>
        {photos.map((src, index) => <button type="button" key={src} aria-label={`${t("Photo")} ${index + 1}`} aria-pressed={index === active} className={`vehicle-gallery-thumb${index === active ? " is-active" : ""}`} onClick={() => setActive(index)}>
          <BlurImage src={src} alt="" fill sizes="110px" />
        </button>)}
      </div>}
    </div>
    {expanded && <div className="vehicle-gallery-modal" role="dialog" aria-modal="true" aria-label={`${t("Photos du véhicule")} ${vehicleName}`} onMouseDown={(event) => {if (event.target === event.currentTarget) setExpanded(false);}}>
      <div className="vehicle-gallery-modal-head"><strong>{vehicleName}</strong><button ref={closeButton} type="button" onClick={() => setExpanded(false)} aria-label={t("Fermer la galerie")}><X size={23}/></button></div>
      {display(true)}
      {count > 1 && <div className="vehicle-gallery-modal-thumbs">{photos.map((src, index) => <button key={src} type="button" aria-label={`${t("Photo")} ${index + 1}`} aria-pressed={index === active} className={index === active ? "is-active" : ""} onClick={() => setActive(index)}><BlurImage src={src} alt="" fill sizes="90px" /></button>)}</div>}
    </div>}
  </div>;
}
