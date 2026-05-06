"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function RouteTransitionManager() {
  const pathname = usePathname();

  useEffect(() => {
    const updateHeaderTone = () => {
      if (typeof document === "undefined") return;
      if (window.scrollY > 14) {
        document.body.classList.add("header-scrolled");
      } else {
        document.body.classList.remove("header-scrolled");
      }
    };

    if (typeof document === "undefined") return;
    document.body.classList.remove("route-transitioning");
    document.body.classList.add("route-entering");
    updateHeaderTone();

    window.addEventListener("scroll", updateHeaderTone, { passive: true });
    const timeout = window.setTimeout(() => {
      document.body.classList.remove("route-entering");
    }, 260);

    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener("scroll", updateHeaderTone);
    };
  }, [pathname]);

  return null;
}
