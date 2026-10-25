"use client";

import { useEffect, useMemo, useState } from "react";
import {
  LoaderCircle,
  Moon,
  Plus,
  Share2,
  Sun,
} from "lucide-react";

import { LinkCard } from "@/components/profile/link-card";
import { LinkForm } from "@/components/profile/link-form";
import { isSafeExternalUrl, type LinkFormValues } from "@/lib/link-validation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfileStore } from "@/stores/profile-store";
import type { ThemePreference } from "@/types/profile";

function resolveTheme(theme: ThemePreference) {
  if (theme !== "system") return theme;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function MyPage() {
  const profile = useProfileStore((state) => state.profile);
  const blocks = useProfileStore((state) => state.blocks);
  const theme = useProfileStore((state) => state.theme);
  const addLink = useProfileStore((state) => state.addLink);
  const setTheme = useProfileStore((state) => state.setTheme);
  const loadLinks = useProfileStore((state) => state.loadLinks);
  const isLoadingLinks = useProfileStore((state) => state.isLoadingLinks);
  const isMutatingLinks = useProfileStore((state) => state.isMutatingLinks);
  const linksError = useProfileStore((state) => state.linksError);
  const [isDark, setIsDark] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  useEffect(() => {
    void loadLinks();
  }, [loadLinks]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const applyTheme = () => {
      const nextIsDark = resolveTheme(theme) === "dark";
      document.documentElement.classList.toggle("dark", nextIsDark);
      setIsDark(nextIsDark);
    };

    applyTheme();
    media.addEventListener("change", applyTheme);
    return () => media.removeEventListener("change", applyTheme);
  }, [theme]);

  const visibleBlocks = useMemo(
    () =>
      blocks
        .filter((block) => block.visible)
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
      setStatusMessage("마이페이지 주소를 복사했어요.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setStatusMessage("주소를 복사하지 못했어요.");
    }

    window.setTimeout(() => setStatusMessage(""), 2500);
  }

  function showStatus(message: string) {
    setStatusMessage(message);
    window.setTimeout(() => setStatusMessage(""), 2500);
  }

  async function handleAddLink(values: LinkFormValues) {
    await addLink(values);
    setDialogOpen(false);
    showStatus(values.title + " 링크를 추가했어요.");
  }

  function handleDialogOpenChange(open: boolean) {
    if (isMutatingLinks) return;
    setDialogOpen(open);
  }

  const initial = profile.displayName.trim().charAt(0) || "M";
  const hasVisibleLinks = visibleBlocks.some((block) => block.type === "link");
  const isInitialLoading = isLoadingLinks && blocks.length === 0;

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-border/70 bg-background/88 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-3xl items-center justify-between px-6">
          <a href="/mypage" className="flex items-center gap-2 font-medium tracking-tight" aria-label="마이페이지 홈">
            <span className="flex size-8 items-center justify-center rounded-[12px] bg-primary text-sm font-medium text-primary-foreground">
              M
            </span>
            <span>mylink</span>
          </a>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon-lg" className="rounded-[18px]" onClick={toggleTheme} aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}>
              {isDark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
            </Button>
            <Button variant="ghost" size="icon-lg" className="rounded-[18px]" onClick={shareProfile} aria-label="마이페이지 공유">
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

        <section className="mt-10" aria-labelledby="link-list-title">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 id="link-list-title" className="text-lg font-medium tracking-[-0.01em]">내 링크</h2>
              <p className="mt-1 text-sm text-muted-foreground">추가한 링크를 저장하고 언제든 확인하세요.</p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
              <DialogTrigger render={<Button className="h-10 shrink-0 rounded-[16px] px-4" disabled={isMutatingLinks || isLoadingLinks || Boolean(linksError)} aria-busy={isLoadingLinks || isMutatingLinks} />}>
                {isLoadingLinks || isMutatingLinks ? <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <Plus aria-hidden="true" />}
                링크 추가
              </DialogTrigger>
              <DialogContent className="gap-5 rounded-[24px] p-5 sm:max-w-md">
                <DialogHeader className="pr-8">
                  <DialogTitle className="text-xl">새 링크 추가</DialogTitle>
                  <DialogDescription>방문자에게 보여줄 외부 링크 정보를 입력해 주세요.</DialogDescription>
                </DialogHeader>
                <LinkForm onSave={handleAddLink} submitLabel="추가하기" disabled={isMutatingLinks} />
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-3" aria-busy={isLoadingLinks}>
            {isInitialLoading ? (
              <div className="space-y-3" aria-hidden="true">
                {Array.from({ length: 3 }, (_, index) => (
                  <div key={index} className="flex min-h-[76px] items-center gap-3 rounded-[20px] border border-border/80 bg-card px-3 py-3">
                    <Skeleton className="size-12 shrink-0 rounded-[14px] motion-reduce:animate-none" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-2/5 motion-reduce:animate-none" />
                      <Skeleton className="h-3 w-3/4 motion-reduce:animate-none" />
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
            {linksError ? (
              <div className="rounded-[20px] bg-muted px-6 py-6 text-center">
                <p className="text-sm text-destructive" role="alert">{linksError}</p>
                <Button variant="outline" className="mt-3" onClick={() => void loadLinks()}>다시 시도</Button>
              </div>
            ) : null}
            {visibleBlocks.map((block) =>
              block.type === "section" ? (
                <h3 key={block.id} className="px-1 pb-1 pt-5 text-[14px] font-medium text-muted-foreground first:pt-0">
                  {block.title}
                </h3>
              ) : (
                <LinkCard key={block.id} block={block} onSuccess={showStatus} />
              ),
            )}

            {!isLoadingLinks && !linksError && !hasVisibleLinks ? (
              <div className="rounded-[20px] bg-muted px-6 py-10 text-center text-sm text-muted-foreground">
                아직 등록된 링크가 없어요.
              </div>
            ) : null}
          </div>
        </section>

        <footer className="pt-12 text-center text-sm font-medium text-muted-foreground">mylink</footer>
      </main>

      <p className="sr-only" role="status" aria-live="polite">{statusMessage}</p>
      {statusMessage ? (
        <div className="fixed bottom-6 left-1/2 z-20 -translate-x-1/2 rounded-[18px] bg-foreground px-4 py-3 text-sm text-background shadow-lg" aria-hidden="true">
          {statusMessage}
        </div>
      ) : null}
    </>
  );
}
