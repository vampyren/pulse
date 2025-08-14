/**
 * Pulse Web — components/LanguageMenu.tsx
 * Version: v0.2.0
 * Purpose: Language selector using Popover (consistent UI with theme)
 */

import React from "react";
import { Popover, PopoverTrigger, PopoverContent, usePopover } from "@/components/ui/Popover";
import Button from "@/components/ui/Button";

const LANGS = [
  { id: "en", label: "English", emoji: "🇬🇧" },
  { id: "sv", label: "Svenska", emoji: "🇸🇪" },
] as const;

function LanguageList({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const { setOpen } = usePopover();
  return (
    <div className="grid gap-2">
      {LANGS.map((l) => {
        const active = l.id === value;
        return (
          <button
            key={l.id}
            onClick={() => { onChange(l.id); setOpen(false); }}
            className={`w-full rounded-xl border px-3 py-2 text-left text-sm ${
              active ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-gray-800 border-gray-300"
            }`}
          >
            <span className="mr-2">{l.emoji}</span>
            {l.label}
          </button>
        );
      })}
    </div>
  );
}

export default function LanguageMenu() {
  const [lang, setLang] = React.useState<string>(() => localStorage.getItem("pulse.lang") || "en");

  function setLanguage(v: string) {
    setLang(v);
    localStorage.setItem("pulse.lang", v);
    // TODO: plug into i18n provider when we add it
  }

  const current = LANGS.find((l) => l.id === lang) || LANGS[0];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="sm" variant="ghost" className="rounded-full">
          <span className="mr-2">🌐</span>
          {current.emoji}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-2">
        <LanguageList value={lang} onChange={setLanguage} />
      </PopoverContent>
    </Popover>
  );
}
