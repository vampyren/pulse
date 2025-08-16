/**
 * Pulse — components/LanguageMenu.tsx
 * Version: v0.3.4
 * Purpose: Globe + current flag pill (uses kit Button) with a glass dropdown matching Me menu.
 * Fix: no React ref on Button (your Button doesn't forward refs) → TypeScript safe.
 */

import React, { useEffect, useRef, useState } from "react";
import Button from "@/components/ui/Button";
import { useTranslation } from "react-i18next";

type Lang = { code: string; label: string; flag: string };

const LS_KEY = "pulse.lang";
const LANGS: Lang[] = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "sv", label: "Svenska", flag: "🇸🇪" },
];

export default function LanguageMenu(): JSX.Element {
  const { i18n } = useTranslation();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);

  // resolve current language
  const currentCode =
    (i18n?.language || localStorage.getItem(LS_KEY) || navigator.language || "en")
      .slice(0, 2)
      .toLowerCase();
  const current = LANGS.find((l) => l.code === currentCode) || LANGS[0];

  // outside click + Escape
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  function setLang(code: string) {
    try {
      localStorage.setItem(LS_KEY, code);
      if (i18n && typeof i18n.changeLanguage === "function") i18n.changeLanguage(code);
      window.dispatchEvent(new CustomEvent("langchange", { detail: code }));
    } finally {
      setOpen(false);
    }
  }

  return (
    <div ref={rootRef} className="relative">
      {/* Trigger: kit Button (outline/sm) → globe + current flag */}
      <Button
        variant="outline"
        size="sm"
        className="rounded-full"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Language"
        title="Language"
        onClick={() => setOpen((v) => !v)}
      >
        <span aria-hidden>🌐</span>
        <span aria-hidden className="ml-2">{current.flag}</span>
        <span className="sr-only">{current.label}</span>
      </Button>

      {/* Glass dropdown (matches Me menu) */}
      {open && (
        <div
          role="listbox"
          aria-label="Select language"
          className="absolute right-0 mt-2 w-44 overflow-hidden rounded-2xl border border-white/15 bg-white/20 backdrop-blur-2xl ring-1 ring-white/10 shadow-lg z-[3000]"
        >
          {LANGS.map((lang) => {
            const active = lang.code === current.code;
            return (
              <button
                key={lang.code}
                role="option"
                aria-selected={active}
                onClick={() => setLang(lang.code)}
                className={[
                  "flex w-full items-center gap-2 px-3 py-2 text-left text-sm",
                  active ? "bg-white/25 font-medium" : "hover:bg-white/20"
                ].join(" ")}
              >
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
                {active && <span className="ml-auto">✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
