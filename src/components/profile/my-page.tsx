"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState, type ComponentType } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Camera,
  Code2,
  ExternalLink,
  Globe2,
  Link as LinkIcon,
  Moon,
  Play,
  Plus,
  Share2,
  Sun,
  type LucideProps,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useProfileStore } from "@/stores/profile-store";
import type { LinkBlock, LinkIcon as LinkIconName, ThemePreference } from "@/types/profile";

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

const linkFormSchema = z.object({
  title: z
    .string()
    .refine((value) => value.trim().length > 0, "링크 제목을 입력해 주세요.")
    .refine((value) => value.trim().length <= 50, "링크 제목은 50자 이하로 입력해 주세요."),
  url: z
    .string()
    .refine((value) => value.trim().length > 0, "URL을 입력해 주세요.")
    .refine((value) => value.trim().length === 0 || isSafeExternalUrl(value.trim()), "http:// 또는 https://로 시작하는 올바른 URL을 입력해 주세요."),
  description: z
    .string()
    .refine((value) => value.trim().length <= 100, "설명은 100자 이하로 입력해 주세요."),
});

type LinkFormValues = z.infer<typeof linkFormSchema>;

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
          {block.description || block.url}
        </span>
      </span>
      <ExternalLink
        className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        aria-hidden="true"
      />
    </a>
  );
}

export function MyPage() {
  const profile = useProfileStore((state) => state.profile);
  const blocks = useProfileStore((state) => state.blocks);
  const theme = useProfileStore((state) => state.theme);
  const addLink = useProfileStore((state) => state.addLink);
  const setTheme = useProfileStore((state) => state.setTheme);
  const subscribeLinks = useProfileStore((state) => state.subscribeLinks);
  const isLoadingLinks = useProfileStore((state) => state.isLoadingLinks);
  const linksError = useProfileStore((state) => state.linksError);
  const [linksRetryKey, setLinksRetryKey] = useState(0);
  const [isDark, setIsDark] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<LinkFormValues>({
    resolver: zodResolver(linkFormSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    defaultValues: {
      title: "",
      url: "",
      description: "",
    },
  });

  useEffect(() => subscribeLinks(), [subscribeLinks, linksRetryKey]);

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
      setStatusMessage("마이페이지 주소를 복사했어요.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setStatusMessage("주소를 복사하지 못했어요.");
    }

    window.setTimeout(() => setStatusMessage(""), 2500);
  }

  async function handleAddLink(values: LinkFormValues) {
    const title = values.title.trim();
    clearErrors("root");
    try {
      await addLink({
        title,
        url: values.url.trim(),
        description: values.description.trim(),
      });
      reset();
      setDialogOpen(false);
      setStatusMessage(`${title} 링크를 추가했어요.`);
      window.setTimeout(() => setStatusMessage(""), 2500);
    } catch {
      setError("root", { message: "링크를 저장하지 못했어요. 연결을 확인하고 다시 시도해 주세요." });
    }
  }

  function handleDialogOpenChange(open: boolean) {
    if (isSubmitting) return;
    setDialogOpen(open);
    if (!open) reset();
  }

  const initial = profile.displayName.trim().charAt(0) || "M";
  const hasVisibleLinks = visibleBlocks.some((block) => block.type === "link");

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
              <DialogTrigger render={<Button className="h-10 shrink-0 rounded-[16px] px-4" disabled={isLoadingLinks || Boolean(linksError)} />}>
                <Plus aria-hidden="true" />
                링크 추가
              </DialogTrigger>
              <DialogContent className="gap-5 rounded-[24px] p-5 sm:max-w-md">
                <DialogHeader className="pr-8">
                  <DialogTitle className="text-xl">새 링크 추가</DialogTitle>
                  <DialogDescription>방문자에게 보여줄 외부 링크 정보를 입력해 주세요.</DialogDescription>
                </DialogHeader>
                <form className="space-y-5" onSubmit={handleSubmit(handleAddLink)} aria-busy={isSubmitting} noValidate>
                  <fieldset disabled={isSubmitting} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="link-title">제목</Label>
                      <Input
                        id="link-title"
                        autoComplete="off"
                        placeholder="예: 블로그"
                        className="h-11 rounded-[14px] px-3"
                        aria-invalid={Boolean(errors.title)}
                        aria-describedby={errors.title ? "link-title-error" : undefined}
                        {...register("title")}
                      />
                      {errors.title ? <p id="link-title-error" className="text-xs leading-5 text-destructive" role="alert">{errors.title.message}</p> : null}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="link-url">URL</Label>
                      <Input
                        id="link-url"
                        type="url"
                        inputMode="url"
                        autoComplete="url"
                        placeholder="https://example.com"
                        className="h-11 rounded-[14px] px-3"
                        aria-invalid={Boolean(errors.url)}
                        aria-describedby={errors.url ? "link-url-error" : "link-url-hint"}
                        {...register("url")}
                      />
                      <p id="link-url-hint" className="text-xs leading-5 text-muted-foreground">http:// 또는 https://로 시작하는 주소를 입력하세요.</p>
                      {errors.url ? <p id="link-url-error" className="text-xs leading-5 text-destructive" role="alert">{errors.url.message}</p> : null}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="link-description">설명 <span className="font-normal text-muted-foreground">(선택)</span></Label>
                      <Input
                        id="link-description"
                        autoComplete="off"
                        placeholder="링크를 짧게 소개해 주세요."
                        className="h-11 rounded-[14px] px-3"
                        aria-invalid={Boolean(errors.description)}
                        aria-describedby={errors.description ? "link-description-error" : undefined}
                        {...register("description")}
                      />
                      {errors.description ? <p id="link-description-error" className="text-xs leading-5 text-destructive" role="alert">{errors.description.message}</p> : null}
                    </div>
                  </fieldset>
                  {errors.root ? <p className="text-sm text-destructive" role="alert">{errors.root.message}</p> : null}
                  <DialogFooter className="mx-0 mb-0 rounded-[18px] border-0 bg-muted/60 p-3">
                    <Button type="submit" disabled={isSubmitting} className="h-10 rounded-[14px] px-5">{isSubmitting ? "저장 중…" : "추가하기"}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-3">
            {isLoadingLinks ? <p className="py-6 text-center text-sm text-muted-foreground" role="status">링크를 불러오는 중이에요.</p> : null}
            {linksError ? (
              <div className="rounded-[20px] bg-muted px-6 py-6 text-center">
                <p className="text-sm text-destructive" role="alert">{linksError}</p>
                <Button variant="outline" className="mt-3" onClick={() => setLinksRetryKey((key) => key + 1)}>다시 시도</Button>
              </div>
            ) : null}
            {visibleBlocks.map((block) =>
              block.type === "section" ? (
                <h3 key={block.id} className="px-1 pb-1 pt-5 text-[14px] font-medium text-muted-foreground first:pt-0">
                  {block.title}
                </h3>
              ) : (
                <ProfileLink key={block.id} block={block} />
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
