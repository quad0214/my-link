"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { AuthControls, MyPublicPageLink } from "@/components/profile/auth-controls";
import { Button } from "@/components/ui/button";
import { useProfileStore } from "@/stores/profile-store";
import type { ThemePreference } from "@/types/profile";

function resolveTheme(theme: ThemePreference) {
  if (theme !== "system") return theme;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function SiteHeader() {
  const theme = useProfileStore((state) => state.theme);
  const setTheme = useProfileStore((state) => state.setTheme);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const applyTheme = () => {
      const dark = resolveTheme(theme) === "dark";
      document.documentElement.classList.toggle("dark", dark);
      setIsDark(dark);
    };
    applyTheme();
    media.addEventListener("change", applyTheme);
    return () => media.removeEventListener("change", applyTheme);
  }, [theme]);

  return (
    <header className="sticky top-0 z-10 border-b border-border/70 bg-background/88 backdrop-blur-xl">
      <div className="mx-auto flex min-h-16 w-full max-w-3xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2 rounded-lg font-medium tracking-tight focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40" aria-label="mylink 홈">
          <span className="flex size-8 items-center justify-center rounded-[12px] bg-primary text-sm text-primary-foreground">M</span>
          <span className="text-sm sm:text-base">mylink</span>
        </Link>
        <div className="flex min-w-0 items-center justify-end gap-1 sm:gap-2">
          <Button variant="ghost" size="icon-lg" className="rounded-[18px]" onClick={() => setTheme(resolveTheme(theme) === "dark" ? "light" : "dark")} aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}>
            {isDark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
          </Button>
          <MyPublicPageLink compact />
          <AuthControls />
        </div>
      </div>
    </header>
  );
}
