"use client";

import { MoonStar, SunMedium } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  const darkMode = resolvedTheme === "dark";

  return (
    <Button
      variant="secondary"
      size="icon"
      className="control-surface h-9 w-9"
      onClick={() => setTheme(darkMode ? "light" : "dark")}
      aria-label="Toggle theme"
    >
      <SunMedium className="hidden h-4 w-4 dark:block" />
      <MoonStar className="h-4 w-4 dark:hidden" />
    </Button>
  );
}
