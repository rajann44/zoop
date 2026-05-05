"use client";

import { MoonStar, SunMedium } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const darkMode = theme === "dark";

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(darkMode ? "light" : "dark")}
      aria-label="Toggle theme"
    >
      {darkMode ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
    </Button>
  );
}
