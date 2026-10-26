"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useLocale } from "@/lib/i18n";

const STORAGE_KEY = "syrine-theme";
type Theme = "dark" | "light";

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  const themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  themeColor?.setAttribute("content", theme === "dark" ? "#0d0f0e" : "#f8f7f3");
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");
  const { t } = useLocale();

  useEffect(() => {
    // The head script applies the saved theme before the first paint.
    const current = document.documentElement.dataset.theme === "light" ? "light" : "dark";
    setTheme(current);
    applyTheme(current);
  }, []);

  function toggleTheme() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // The theme still switches when local storage is disabled.
    }
  }

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={t(theme === "dark" ? "Activer le mode clair" : "Activer le mode sombre")}
      title={t(theme === "dark" ? "Mode clair" : "Mode sombre")}
    >
      {theme === "dark" ? <Sun size={19} strokeWidth={1.9} aria-hidden="true" /> : <Moon size={19} strokeWidth={1.9} aria-hidden="true" />}
    </button>
  );
}
