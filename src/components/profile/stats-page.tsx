"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, ChartNoAxesCombined, Link2, LoaderCircle, MousePointer2, RefreshCw } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { SiteHeader } from "@/components/profile/site-header";
import { SiteFavicon } from "@/components/profile/site-favicon";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { useLinks } from "@/hooks/use-account-data";
import { observeAuth } from "@/lib/firebase-auth";
import { useProfileStore } from "@/stores/profile-store";

const chartConfig = {
  clickCount: { label: "클릭 수", color: "var(--primary)" },
} satisfies ChartConfig;

function StatsContent() {
  const linksQuery = useLinks();
  const links = linksQuery.data ?? [];
  const sortedLinks = [...links].sort((a, b) => b.clickCount - a.clickCount || a.id.localeCompare(b.id));
  const totalClicks = links.reduce((sum, link) => sum + link.clickCount, 0);
  const titles = new Map(links.map((link) => [link.id, link.title]));

  return (
    <main className="mx-auto w-full max-w-3xl space-y-6 px-4 pb-10 pt-8 sm:px-6 sm:pt-12">
      <div className="flex items-end justify-between gap-3 pb-2">
        <div>
          <p className="mb-3 flex items-center gap-1.5 text-xs font-medium text-primary"><ChartNoAxesCombined className="size-3.5" aria-hidden="true" />링크 인사이트</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-[34px]">통계</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">내 링크에 모인 관심을 확인해 보세요.</p>
        </div>
        <Button variant="outline" className="mb-1 h-9 shrink-0 rounded-xl bg-card px-3 text-xs shadow-none" disabled={linksQuery.isFetching} onClick={() => void linksQuery.refetch()}>
          {linksQuery.isFetching ? <LoaderCircle className="animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <RefreshCw aria-hidden="true" />}
          새로고침
        </Button>
      </div>

      {linksQuery.isError ? (
        <div className="rounded-[20px] border border-border bg-card p-6" role="alert">
          <p className="text-sm text-destructive">통계를 불러오지 못했어요. 새로고침해 다시 시도해 주세요.</p>
        </div>
      ) : null}

      {linksQuery.isPending ? (
        <div className="space-y-6" role="status" aria-label="통계 불러오는 중">
          <Skeleton className="h-36 w-full rounded-[24px]" />
          <Skeleton className="h-80 w-full rounded-[24px]" />
        </div>
      ) : linksQuery.data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-[1.65fr_1fr]">
            <section className="relative isolate overflow-hidden rounded-[24px] bg-primary p-6 text-primary-foreground shadow-[0_12px_36px_-22px_var(--primary)] sm:p-7" aria-labelledby="total-clicks-title">
              <div className="pointer-events-none absolute -right-12 -top-20 -z-10 size-64 rounded-full border-[36px] border-white/10" aria-hidden="true" />
              <div className="flex items-center gap-2 text-sm font-medium">
                <span className="flex size-8 items-center justify-center rounded-xl bg-white/15"><MousePointer2 className="size-4" aria-hidden="true" /></span>
                <h2 id="total-clicks-title">총 클릭 수</h2>
              </div>
              <p className="mt-6 break-all text-5xl font-semibold tabular-nums tracking-[-0.04em] sm:text-6xl">{totalClicks.toLocaleString("ko-KR")}</p>
              <p className="mt-5 text-xs leading-5 text-primary-foreground/80">현재 저장된 모든 링크의 누적 클릭 수</p>
            </section>
            <section className="flex flex-col justify-between rounded-[24px] border border-border/70 bg-card p-6 sm:p-7" aria-labelledby="link-count-title">
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><Link2 className="size-4" aria-hidden="true" /><h2 id="link-count-title">등록된 링크</h2></div>
                <p className="mt-4 text-4xl font-semibold tabular-nums tracking-tight">{links.length.toLocaleString("ko-KR")}<span className="ml-1.5 text-sm font-normal text-muted-foreground">개</span></p>
              </div>
              <Link href="/" className="mt-5 inline-flex w-fit items-center gap-1 text-xs font-medium text-primary hover:underline">내 링크 관리<ArrowUpRight className="size-3.5" aria-hidden="true" /></Link>
            </section>
          </div>

          <section className="min-w-0 rounded-[24px] border border-border/70 bg-card p-5 sm:p-7" aria-labelledby="link-chart-title">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id="link-chart-title" className="text-base font-semibold">링크별 클릭 수</h2>
                <p className="mt-1.5 text-xs leading-5 text-muted-foreground">어떤 링크에 관심이 모였는지 살펴보세요.</p>
              </div>
              <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-[11px] text-muted-foreground">누적 기준</span>
            </div>
            {links.length ? (
              <>
                <div className="mt-6 max-h-[420px] overflow-y-auto">
                  <ChartContainer config={chartConfig} className="min-h-[240px] w-full aspect-auto" style={{ height: Math.max(240, links.length * 48) }}>
                    <BarChart accessibilityLayer data={sortedLinks} layout="vertical" margin={{ left: 0, right: 24, top: 8, bottom: 8 }}>
                      <CartesianGrid horizontal={false} strokeDasharray="3 5" />
                      <XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} />
                      <YAxis dataKey="id" type="category" axisLine={false} tickLine={false} width={100} tickFormatter={(id: string) => {
                        const title = titles.get(id) ?? id;
                        return title.length > 10 ? title.slice(0, 10) + "…" : title;
                      }} />
                      <ChartTooltip cursor={false} content={<ChartTooltipContent labelFormatter={(id) => titles.get(String(id)) ?? String(id)} />} />
                      <Bar dataKey="clickCount" fill="var(--color-clickCount)" radius={[0, 5, 5, 0]} maxBarSize={20} isAnimationActive={false} />
                    </BarChart>
                  </ChartContainer>
                </div>
              </>
            ) : (
              <div className="py-16 text-center">
                <span className="mx-auto mb-4 flex size-14 items-center justify-center rounded-[18px] bg-primary/8 text-primary"><ChartNoAxesCombined className="size-6" aria-hidden="true" /></span>
                <p className="text-sm text-muted-foreground">아직 등록된 링크가 없어요.</p>
                <Link href="/" className="mt-3 inline-block text-sm font-medium text-primary hover:underline">링크 추가하러 가기</Link>
              </div>
            )}
          </section>

          {links.length > 0 ? (
            <section className="overflow-hidden rounded-[24px] border border-border/70 bg-card" aria-labelledby="link-ranking-title">
              <div className="flex items-center justify-between gap-3 border-b border-border/60 px-5 py-5 sm:px-7">
                <h2 id="link-ranking-title" className="text-base font-semibold">링크 순위</h2>
                <span className="text-xs text-muted-foreground">클릭 수 · 비중</span>
              </div>
              <ol className="divide-y divide-border/50">
                {sortedLinks.map((link, index) => {
                  const share = totalClicks > 0 ? link.clickCount / totalClicks * 100 : 0;
                  return (
                    <li key={link.id} className="flex items-center gap-3 px-5 py-4 sm:gap-4 sm:px-7">
                      <span className={`w-4 shrink-0 text-center text-xs font-medium tabular-nums ${index === 0 && totalClicks > 0 ? "text-primary" : "text-muted-foreground"}`}>{index + 1}</span>
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted"><SiteFavicon url={link.url} /></span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium" title={link.title}>{link.title}</p>
                        <div className="mt-2 h-1 w-full max-w-48 overflow-hidden rounded-full bg-muted" aria-hidden="true"><div className="h-full rounded-full bg-primary/65" style={{ width: `${share}%` }} /></div>
                      </div>
                      <div className="shrink-0 text-right tabular-nums">
                        <p className="text-sm font-semibold" aria-label={`클릭 수 ${link.clickCount}회`}>{link.clickCount.toLocaleString("ko-KR")}</p>
                        <p className="mt-1 text-[11px] text-muted-foreground">{share.toFixed(1)}%</p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>
          ) : null}
          <p className="text-center text-xs leading-5 text-muted-foreground">비공개 링크를 포함한 통계입니다. 새로고침하면 최신 수치가 반영돼요.</p>
        </>
      ) : null}
      <footer className="pt-4 text-center text-xs font-medium tracking-wide text-muted-foreground/70">mylink</footer>
    </main>
  );
}

export function StatsPage() {
  const router = useRouter();
  const user = useProfileStore((state) => state.user);
  const sessionId = useProfileStore((state) => state.sessionId);
  const isAuthLoading = useProfileStore((state) => state.isAuthLoading);
  const setUser = useProfileStore((state) => state.setUser);
  const failAuth = useProfileStore((state) => state.failAuth);
  const [authResolved, setAuthResolved] = useState(false);

  useEffect(() => observeAuth((nextUser) => {
    setUser(nextUser);
    setAuthResolved(true);
  }, () => {
    failAuth();
    setAuthResolved(true);
  }), [setUser, failAuth]);

  useEffect(() => {
    if (authResolved && !isAuthLoading && !user) router.replace("/");
  }, [authResolved, isAuthLoading, user, router]);

  if (!authResolved || isAuthLoading || !user) {
    return <main className="flex flex-1 items-center justify-center py-24" role="status" aria-label="로그인 상태 확인 중"><LoaderCircle className="size-6 animate-spin text-primary motion-reduce:animate-none" aria-hidden="true" /></main>;
  }

  return (
    <>
      <SiteHeader />
      <StatsContent key={user.uid + ":" + sessionId} />
    </>
  );
}
