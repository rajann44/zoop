"use client";

import { useEffect, useState } from "react";
import { Palette, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type RenderingMode = "full-color" | "accented";

const STORAGE_KEY = "saada-rendering-mode";

export function RenderingModeToggle() {
  const [mode, setMode] = useState<RenderingMode>(() => {
    if (typeof window === "undefined") return "full-color";
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved === "accented" || saved === "full-color" ? saved : "full-color";
  });

  useEffect(() => {
    applyMode(mode);
  }, [mode]);

  const updateMode = (next: RenderingMode) => {
    setMode(next);
    applyMode(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  };

  return (
    <div className="glass-soft inline-flex items-center gap-1 rounded-xl p-1" aria-label="Rendering mode">
      <button
        type="button"
        onClick={() => updateMode("full-color")}
        className={cn(
          "inline-flex h-8 items-center gap-1 rounded-lg px-2.5 text-xs font-medium transition-colors",
          mode === "full-color" ? "bg-accent text-accent-foreground" : "text-foreground/80 hover:bg-muted/70",
        )}
      >
        <Palette className="h-3.5 w-3.5" />
        Full
      </button>
      <button
        type="button"
        onClick={() => updateMode("accented")}
        className={cn(
          "inline-flex h-8 items-center gap-1 rounded-lg px-2.5 text-xs font-medium transition-colors",
          mode === "accented" ? "bg-accent text-accent-foreground" : "text-foreground/80 hover:bg-muted/70",
        )}
      >
        <Sparkles className="h-3.5 w-3.5" />
        Accented
      </button>
    </div>
  );
}

function applyMode(mode: RenderingMode) {
  const root = document.documentElement;
  root.classList.toggle("rendering-accented", mode === "accented");
}
