"use client";

import { useEffect } from "react";

export function ThemeFromQuery() {
  useEffect(() => {
    const theme = new URLSearchParams(window.location.search).get("theme");
    if (theme === "light" || theme === "dark") {
      document.documentElement.dataset.theme = theme;
    }
    return () => {
      delete document.documentElement.dataset.theme;
    };
  }, []);
  return null;
}
