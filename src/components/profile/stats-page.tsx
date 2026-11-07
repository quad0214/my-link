"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, LoaderCircle, MousePointer2, RefreshCw } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { AuthControls } from "@/components/profile/auth-controls";
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
    <main className="mx-auto w-full max-w-3xl space-y-6 px-6 pb-12 pt-10 sm:pt-14">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-medium">통계</h1>
          <p className="mt-2 text-sm text-muted-foreground">내 링크가 받은 클릭을 한눈에 확인하세요.</p>
        </div>
        <Button variant="outline" className="shrink-0 rounded-[14px]" disabled={linksQuery.isFetching} onClick={() => void linksQuery.refetch()}>
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
          <section className="rounded-[24px] border border-border/80 bg-card p-6" aria-labelledby="total-clicks-title">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MousePointer2 className="size-4" aria-hidden="true" />
              <h2 id="total-clicks-title">총 클릭 수</h2>
            </div>
            <p className="mt-3 text-4xl font-semibold tabular-nums tracking-tight">{totalClicks.toLocaleString("ko-KR")}</p>
            <p className="mt-3 text-xs text-muted-foreground">현재 저장된 모든 링크 합산 · 비공개 링크 포함</p>
          </section>

          <section className="min-w-0 rounded-[24px] border border-border/80 bg-card p-5 sm:p-6" aria-labelledby="link-chart-title">
            <h2 id="link-chart-title" className="text-lg font-medium">링크별 클릭 수</h2>
            <p className="mt-1 text-sm text-muted-foreground">클릭이 많은 링크부터 보여드려요.</p>
            {links.length ? (
              <>
                <div className="mt-6 max-h-[520px] overflow-y-auto">
                  <ChartContainer config={chartConfig} className="min-h-[240px] w-full aspect-auto" style={{ height: Math.max(240, links.length * 48) }}>
                    <BarChart accessibilityLayer data={sortedLinks} layout="vertical" margin={{ left: 0, right: 24, top: 8, bottom: 8 }}>
                      <CartesianGrid horizontal={false} />
                      <XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} />
                      <YAxis dataKey="id" type="category" axisLine={false} tickLine={false} width={100} tickFormatter={(id: string) => {
                        const title = titles.get(id) ?? id;
                        return title.length > 10 ? title.slice(0, 10) + "…" : title;
                      }} />
                      <ChartTooltip cursor={false} content={<ChartTooltipContent labelFormatter={(id) => titles.get(String(id)) ?? String(id)} />} />
                      <Bar dataKey="clickCount" fill="var(--color-clickCount)" radius={[0, 6, 6, 0]} maxBarSize={28} isAnimationActive={false} />
                    </BarChart>
                  </ChartContainer>
                </div>
                <table className="sr-only">
                  <caption>링크별 클릭 수</caption>
                  <thead><tr><th scope="col">링크</th><th scope="col">클릭 수</th></tr></thead>
                  <tbody>{sortedLinks.map((link) => <tr key={link.id}><th scope="row">{link.title}</th><td>{link.clickCount}</td></tr>)}</tbody>
                </table>
              </>
            ) : (
              <div className="py-16 text-center">
                <p className="text-sm text-muted-foreground">아직 등록된 링크가 없어요.</p>
                <Link href="/" className="mt-3 inline-block text-sm font-medium text-primary hover:underline">링크 추가하러 가기</Link>
              </div>
            )}
          </section>
        </>
      ) : null}
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
      <header className="border-b border-border/70">
        <div className="mx-auto flex min-h-16 max-w-3xl items-center justify-between gap-3 px-6 py-3">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium hover:text-primary"><ArrowLeft className="size-4" aria-hidden="true" />내 링크</Link>
          <AuthControls />
        </div>
      </header>
      <StatsContent key={user.uid + ":" + sessionId} />
    </>
  );
}
