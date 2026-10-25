"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  LoaderCircle,
  Moon,
  Plus,
  Link as LinkIcon,
  Sun,
} from "lucide-react";

import { AuthControls, GoogleLoginButton, MyPublicPageLink } from "@/components/profile/auth-controls";
import { useAccountBusy, useCurrentProfile, useLinks, useLinkWrite } from "@/hooks/use-account-data";
import { observeAuth } from "@/lib/firebase-auth";
import { ProfileEditor } from "@/components/profile/profile-editor";
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

function AuthenticatedProfile() {
  const { profile } = useCurrentProfile();
  const linksQuery = useLinks();
  const blocks = linksQuery.data;
  const linkWrite = useLinkWrite();
  const isLoadingLinks = linksQuery.isFetching;
  const isMutatingLinks = useAccountBusy("links");
  const linksError = linksQuery.isError ? "링크를 불러오지 못했어요. 다시 시도해 주세요." : null;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const visibleBlocks = useMemo(
    () =>
      (blocks || [])
        .filter((block) => block.visible)
        .filter((block) => isSafeExternalUrl(block.url)),
    [blocks],
  );

  function showStatus(message: string) {
    setStatusMessage(message);
    window.setTimeout(() => setStatusMessage(""), 2500);
  }

  async function handleAddLink(values: LinkFormValues) {
    await linkWrite.mutateAsync({ type: "add", values });
    setDialogOpen(false);
    showStatus(values.title + " 링크를 추가했어요.");
  }

  function handleDialogOpenChange(open: boolean) {
    if (isMutatingLinks) return;
    setDialogOpen(open);
  }

  if (!profile) return null;

  const initial = profile.username.trim().charAt(0) || "M";
  const hasVisibleLinks = visibleBlocks.some((block) => block.type === "link");
  const isInitialLoading = linksQuery.isPending;

  return (
    <>


      <main className="mx-auto w-full max-w-[520px] px-6 pb-12 pt-10 sm:pt-14">
        <section className="flex flex-col items-center text-center" aria-labelledby="profile-name">
          <Avatar className="size-24 rounded-[26px] shadow-[0_14px_36px_-22px_var(--primary)] after:rounded-[26px]">
            {profile.avatarUrl ? (
              <AvatarImage className="rounded-[26px]" src={profile.avatarUrl} alt={`${profile.username} 프로필 사진`} />
            ) : null}
            <AvatarFallback className="rounded-[26px] bg-primary/10 text-2xl font-medium text-primary">
              {initial}
            </AvatarFallback>
          </Avatar>
          <ProfileEditor profile={profile} field="username" />
          <ProfileEditor profile={profile} field="displayname" />
          <ProfileEditor profile={profile} field="bio" />
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
                <Button variant="outline" className="mt-3" onClick={() => void linksQuery.refetch()}>다시 시도</Button>
              </div>
            ) : null}
            {visibleBlocks.map((block) => <LinkCard key={block.id} block={block} onSuccess={showStatus} />)}

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

export function MyPage() {
  const user = useProfileStore((state) => state.user);
  const sessionId = useProfileStore((state) => state.sessionId);
  const isAuthLoading = useProfileStore((state) => state.isAuthLoading);
  const authError = useProfileStore((state) => state.authError);
  const profileQuery = useCurrentProfile();
  const profileError = profileQuery.isError ? "프로필을 불러오지 못했어요. 새로고침해 주세요." : null;
  const setUser = useProfileStore((state) => state.setUser);
  const failAuth = useProfileStore((state) => state.failAuth);
  const theme = useProfileStore((state) => state.theme);
  const setTheme = useProfileStore((state) => state.setTheme);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => observeAuth((nextUser) => { void setUser(nextUser); }, failAuth), [setUser, failAuth]);
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
    <>
      <header className="sticky top-0 z-10 border-b border-border/70 bg-background/88 backdrop-blur-xl">
        <div className="mx-auto flex min-h-16 w-full max-w-3xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href="/" className="flex shrink-0 items-center gap-2 font-medium tracking-tight" aria-label="마이페이지 홈">
            <span className="flex size-8 items-center justify-center rounded-[12px] bg-primary text-sm text-primary-foreground">M</span>
            <span className="hidden sm:inline">mylink</span>
          </Link>
          <div className="flex min-w-0 items-center justify-end gap-2">
            <Button variant="ghost" size="icon-lg" className="rounded-[18px]" onClick={() => setTheme(resolveTheme(theme) === "dark" ? "light" : "dark")} aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}>
              {isDark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
            </Button>
            <MyPublicPageLink />
            <AuthControls />
          </div>
        </div>
      </header>
      {authError || profileError ? <div className="mx-auto w-full max-w-[520px] px-6 pt-4"><p className="text-sm text-destructive" role="alert">{authError || profileError}</p></div> : null}
      {isAuthLoading ? (
        <main className="mx-auto flex w-full max-w-[520px] flex-1 items-center justify-center px-6 py-24" aria-busy="true">
          <span role="status" aria-label="로그인 상태 확인 중"><LoaderCircle className="size-6 animate-spin text-primary motion-reduce:animate-none" aria-hidden="true" /></span>
        </main>
      ) : user ? <AuthenticatedProfile key={user.uid + ":" + sessionId} /> : (
        <main className="mx-auto flex w-full max-w-[520px] flex-1 flex-col items-center justify-center px-6 py-20 text-center">
          <span className="flex size-20 items-center justify-center rounded-[24px] bg-primary/10 text-primary"><LinkIcon className="size-8" aria-hidden="true" /></span>
          <p className="mt-7 text-sm font-medium text-primary">나만의 링크 공간</p>
          <h1 className="mt-3 text-[28px] font-medium tracking-tight">나의 모든 링크를 한곳에</h1>
          <p className="mt-4 max-w-sm text-[15px] leading-7 text-muted-foreground">Google 계정으로 로그인하면 나만의 링크를 추가하고, 수정하고, 삭제할 수 있어요.</p>
          <GoogleLoginButton className="mt-8 h-12 px-6" />
          <p className="mt-4 text-xs leading-6 text-muted-foreground">로그인 후 내 계정에 저장된 링크를 확인할 수 있어요.</p>
          <footer className="pt-16 text-sm font-medium text-muted-foreground">mylink</footer>
        </main>
      )}
    </>
  );
}
