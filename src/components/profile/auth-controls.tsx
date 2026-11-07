"use client";

import Link from "next/link";
import { profilePath } from "@/lib/profile-validation";
import { Menu } from "@base-ui/react/menu";
import { ChartNoAxesCombined, ChevronDown, Copy, ExternalLink, LoaderCircle, LogOut } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAccountBusy, useCurrentProfile } from "@/hooks/use-account-data";
import { useProfileStore } from "@/stores/profile-store";

export function GoogleLoginButton({ className = "" }: { className?: string }) {
  const login = useProfileStore((state) => state.login);
  const isAuthBusy = useProfileStore((state) => state.isAuthBusy);
  const isAuthLoading = useProfileStore((state) => state.isAuthLoading);
  return (
    <Button variant="outline" className={"relative h-10 gap-2 rounded-[14px] px-4 " + className} disabled={isAuthBusy || isAuthLoading} aria-busy={isAuthBusy} aria-label={isAuthBusy ? "Google 로그인 처리 중" : "Google로 로그인"} onClick={() => void login()}>
      {isAuthBusy ? <LoaderCircle className="absolute size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" /> : null}
      <span className={"flex items-center gap-2 " + (isAuthBusy ? "invisible" : "")}><span className="font-bold text-primary" aria-hidden="true">G</span>Google로 로그인</span>
    </Button>
  );
}

export function AuthControls() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const user = useProfileStore((state) => state.user);
  const { profile } = useCurrentProfile();
  const isAuthLoading = useProfileStore((state) => state.isAuthLoading);
  const isAuthBusy = useProfileStore((state) => state.isAuthBusy);
  const isMutatingLinks = useAccountBusy("links");
  const isSavingProfile = useAccountBusy("profile");
  const logout = useProfileStore((state) => state.logout);
  if (isAuthLoading) return <span className="flex h-10 w-10 items-center justify-center" role="status" aria-label="로그인 상태 확인 중"><LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" /></span>;
  if (!user) return <GoogleLoginButton />;
  async function copyProfileUrl() {
    if (isCopying) return;
    setIsCopying(true);
    try {
      await navigator.clipboard.writeText(window.location.origin + profilePath(profile!.displayname));
      setMenuOpen(false);
      toast.success("내 페이지 링크를 복사했어요.");
    } catch {
      toast.error("링크를 복사하지 못했어요. 클립보드 권한을 확인해 주세요.");
    } finally {
      setIsCopying(false);
    }
  }

  const name = (profile?.username || "사용자") + "님";
  const menuItemClass = "flex min-h-11 cursor-pointer items-center gap-3 rounded-[10px] px-3 py-2 text-sm outline-none data-highlighted:bg-muted data-disabled:pointer-events-none data-disabled:opacity-50";
  return (
    <Menu.Root open={menuOpen} onOpenChange={setMenuOpen}>
      <Menu.Trigger render={<Button variant="outline" className="relative h-10 gap-2 rounded-[14px] px-2 sm:px-3" disabled={isAuthBusy || isMutatingLinks || isSavingProfile} aria-busy={isAuthBusy} aria-label={name + " 계정 메뉴"} />}>
        {isAuthBusy ? <LoaderCircle className="absolute size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" /> : null}
        <span className={"max-w-14 truncate sm:max-w-28 " + (isAuthBusy ? "invisible" : "")} title={name}>{name}</span>
        <ChevronDown className={"size-4 " + (isAuthBusy ? "invisible" : "")} aria-hidden="true" />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner sideOffset={8} align="end" className="z-50">
          <Menu.Popup className="w-60 max-w-[calc(100vw-2rem)] rounded-[18px] border border-border bg-popover p-2 text-popover-foreground shadow-lg outline-none">
            <Menu.Item className={menuItemClass} render={<Link href="/stats" />}>
              <ChartNoAxesCombined className="size-4" aria-hidden="true" />통계
            </Menu.Item>
            <Menu.Item className={menuItemClass} disabled={isCopying || isAuthBusy} closeOnClick={false} onClick={() => void copyProfileUrl()}>
              {isCopying ? <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}내 페이지 링크 복사
            </Menu.Item>
            <Menu.Separator className="my-1 h-px bg-border" />
            <Menu.Item className={menuItemClass + " text-destructive"} disabled={isAuthBusy || isMutatingLinks || isSavingProfile || isCopying} onClick={() => void logout()}>
              <LogOut className="size-4" aria-hidden="true" />로그아웃
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}

export function MyPublicPageLink({ compact = false }: { compact?: boolean }) {
  const { profile } = useCurrentProfile();
  if (!profile) return null;
  return <Link href={profilePath(profile.displayname)} target="_blank" rel="noopener noreferrer" className={`inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-[14px] border border-border text-xs hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40 sm:px-3 sm:text-sm ${compact ? "w-10 sm:w-auto" : "px-2"}`} aria-label="내 페이지로 가기" title="내 페이지로 가기"><ExternalLink className="size-4" aria-hidden="true" /><span className={compact ? "hidden sm:inline" : undefined}>내 페이지<span className="hidden sm:inline">로 가기</span></span></Link>;
}
