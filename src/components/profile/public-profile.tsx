"use client";

import { useEffect, useMemo, useState } from "react";
import type { ComponentType } from "react";
import {
  Camera,
  Code2,
  ExternalLink,
  Globe2,
  Link as LinkIcon,
  Moon,
  Play,
  Share2,
  Sun,
  type LucideProps,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useProfileStore } from "@/stores/profile-store";
import type { LinkBlock, LinkIcon as LinkIconName, ThemePreference } from "@/types/profile";

import { ProfileSkeleton } from "./profile-skeleton";

const linkIcons: Record<LinkIconName, ComponentType<LucideProps>> = {
  instagram: Camera,
  youtube: Play,
  globe: Globe2,
  github: Code2,
};

function resolveTheme(theme: ThemePreference) {
  if (theme !== "system") return theme;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function isSafeExternalUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function ProfileLink({ block }: { block: LinkBlock }) {
  const Icon = linkIcons[block.icon] ?? LinkIcon;

  return (
    <a
      href={block.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${block.title}: ${block.description}`}
      className={cn(
        buttonVariants({ variant: "outline", size: "lg" }),
        "group h-auto min-h-[76px] w-full justify-start gap-3 rounded-[20px] border-border/80 bg-card px-3 py-3 text-left shadow-none",
        "hover:-translate-y-0.5 hover:border-primary/35 hover:bg-card hover:shadow-[0_10px_30px_-18px_var(--primary)]",
        "focus-visible:ring-3 focus-visible:ring-ring/40 active:translate-y-0",
      )}
    >
      <span className="flex size-12 shrink-0 items-center justify-center rounded-[14px] bg-primary/10 text-primary">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-medium text-foreground">{block.title}</span>
        <span className="mt-1 block truncate text-[13px] font-normal text-muted-foreground">
          {block.description}
        </span>
      </span>
      <ExternalLink
        className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        aria-hidden="true"
      />
    </a>
  );
}

export function PublicProfile() {
  const profile = useProfileStore((state) => state.profile);
  const blocks = useProfileStore((state) => state.blocks);
  const theme = useProfileStore((state) => state.theme);
  const hasHydrated = useProfileStore((state) => state.hasHydrated);
  const setTheme = useProfileStore((state) => state.setTheme);
  const setHasHydrated = useProfileStore((state) => state.setHasHydrated);
  const [shareMessage, setShareMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function hydrate() {
      try {
        await useProfileStore.persist.rehydrate();
      } finally {
        if (active) setHasHydrated(true);
      }
    }

    void hydrate();
    return () => {
      active = false;
    };
  }, [setHasHydrated]);

  useEffect(() => {
    if (!hasHydrated) return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const applyTheme = () => {
      document.documentElement.classList.toggle("dark", resolveTheme(theme) === "dark");
    };

    applyTheme();
    media.addEventListener("change", applyTheme);
    return () => media.removeEventListener("change", applyTheme);
  }, [hasHydrated, theme]);

  const visibleBlocks = useMemo(
    () =>
      blocks
        .filter((block) => block.visible)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .filter((block) => block.type === "section" || isSafeExternalUrl(block.url)),
    [blocks],
  );

  function toggleTheme() {
    setTheme(resolveTheme(theme) === "dark" ? "light" : "dark");
  }

  async function shareProfile() {
    const shareData = {
      title: `${profile.displayName}님의 마이링크`,
      text: profile.bio,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }
      await navigator.clipboard.writeText(shareData.url);
      setShareMessage("프로필 주소를 복사했어요.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setShareMessage("주소를 복사하지 못했어요.");
    }

    window.setTimeout(() => setShareMessage(""), 2500);
  }

  if (!hasHydrated) return <ProfileSkeleton />;

  const initial = profile.displayName.trim().charAt(0) || "M";
  const hasVisibleLinks = visibleBlocks.some((block) => block.type === "link");
  const isDark = resolveTheme(theme) === "dark";

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-border/70 bg-background/88 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-3xl items-center justify-between px-6">
          <a href={`/${profile.username}`} className="flex items-center gap-2 font-medium tracking-tight" aria-label="마이링크 홈">
            <span className="flex size-8 items-center justify-center rounded-[12px] bg-primary text-sm font-medium text-primary-foreground">
              M
            </span>
            <span>mylink</span>
          </a>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon-lg" className="rounded-[18px]" onClick={toggleTheme} aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}>
              {isDark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
            </Button>
            <Button variant="ghost" size="icon-lg" className="rounded-[18px]" onClick={shareProfile} aria-label="프로필 공유">
              <Share2 aria-hidden="true" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[520px] px-6 pb-12 pt-10 sm:pt-14">
        <section className="flex flex-col items-center text-center" aria-labelledby="profile-name">
          <Avatar className="size-24 rounded-[26px] shadow-[0_14px_36px_-22px_var(--primary)] after:rounded-[26px]">
            {profile.avatarUrl ? (
              <AvatarImage className="rounded-[26px]" src={profile.avatarUrl} alt={`${profile.displayName} 프로필 사진`} />
            ) : null}
            <AvatarFallback className="rounded-[26px] bg-primary/10 text-2xl font-medium text-primary">
              {initial}
            </AvatarFallback>
          </Avatar>
          <h1 id="profile-name" className="mt-5 text-[28px] font-medium tracking-[-0.02em] text-foreground">
            {profile.displayName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">@{profile.username}</p>
          <p className="mt-5 max-w-md text-[16px] leading-7 text-foreground/75">{profile.bio}</p>
        </section>

        <section className="mt-10 space-y-3" aria-label="프로필 링크">
          {visibleBlocks.map((block) =>
            block.type === "section" ? (
              <h2 key={block.id} className="px-1 pb-1 pt-5 text-[14px] font-medium text-muted-foreground first:pt-0">
                {block.title}
              </h2>
            ) : (
              <ProfileLink key={block.id} block={block} />
            ),
          )}

          {!hasVisibleLinks ? (
            <div className="rounded-[20px] bg-muted px-6 py-10 text-center text-sm text-muted-foreground">
              아직 등록된 링크가 없어요.
            </div>
          ) : null}
        </section>

        <footer className="pt-12 text-center text-sm font-medium text-muted-foreground">mylink</footer>
      </main>

      <p className="sr-only" role="status" aria-live="polite">
        {shareMessage}
      </p>
      {shareMessage ? (
        <div className="fixed bottom-6 left-1/2 z-20 -translate-x-1/2 rounded-[18px] bg-foreground px-4 py-3 text-sm text-background shadow-lg" aria-hidden="true">
          {shareMessage}
        </div>
      ) : null}
    </>
  );
}
