"use client";

import { useState } from "react";
import { ArrowDown, ArrowUpRight, Camera, Check, ChartNoAxesCombined, Code2, Globe, Link2, Mail, MousePointer2, Palette, Play, Share2 } from "lucide-react";
import { GoogleLoginButton } from "@/components/profile/auth-controls";
import { cn } from "@/lib/utils";

const examples = [
  { label: "크리에이터", name: "서연", handle: "seoyeon", initial: "S", bio: "좋아하는 순간을 기록하고 나눕니다.", role: "일상을 콘텐츠로 만드는 크리에이터", color: "bg-violet-100 text-violet-700 dark:bg-violet-400/15 dark:text-violet-300", links: [
    { title: "나의 유튜브 채널", description: "새로운 영상으로 만나요", icon: Play },
    { title: "인스타그램", description: "조금 더 가까운 일상", icon: Camera },
    { title: "협업 문의", description: "함께 재미있는 일을 만들어요", icon: Mail },
  ] },
  { label: "디자이너", name: "지우", handle: "jiwoo", initial: "J", bio: "작은 차이로 더 나은 경험을 만들어요.", role: "나만의 시선을 담는 프로덕트 디자이너", color: "bg-primary/10 text-primary", links: [
    { title: "디자인 포트폴리오", description: "지금까지 만들어 온 경험들", icon: Palette },
    { title: "작업 노트", description: "과정과 생각을 기록합니다", icon: Globe },
    { title: "프로젝트 문의", description: "좋은 아이디어가 있다면", icon: Mail },
  ] },
  { label: "개발자", name: "민준", handle: "minjun", initial: "M", bio: "아이디어를 코드로, 코드를 일상으로.", role: "직접 만들고 공유하는 개발자", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300", links: [
    { title: "GitHub", description: "직접 만든 프로젝트 모음", icon: Code2 },
    { title: "개발 블로그", description: "배우고 해결한 것들", icon: Globe },
    { title: "이메일 보내기", description: "새로운 연결은 언제나 환영해요", icon: Mail },
  ] },
];

function ExampleProfile({ index = 1 }: { index?: number }) {
  const example = examples[index];
  return (
    <div className="w-full min-w-0 rounded-[28px] border border-border/70 bg-card p-5 shadow-[0_24px_70px_-40px_var(--primary)] sm:p-7">
      <div className="mb-6 flex items-center justify-center gap-1.5 rounded-xl bg-muted/70 px-3 py-2 text-[11px] text-muted-foreground"><Link2 className="size-3" aria-hidden="true" /><span>mylink / {example.handle}</span></div>
      <div className="text-center">
        <div className={cn("mx-auto flex size-16 items-center justify-center rounded-[22px] text-2xl font-semibold", example.color)}>{example.initial}</div>
        <p className="mt-4 text-xl font-semibold">{example.name}</p>
        <p className="mt-1 text-xs text-muted-foreground">@{example.handle}</p>
        <p className="mx-auto mt-4 max-w-60 text-[13px] leading-6 text-foreground/75">{example.bio}</p>
      </div>
      <div className="mt-6 space-y-2.5">
        {example.links.map(({ title, description, icon: Icon }) => (
          <div key={title} className="flex items-center gap-3 rounded-[18px] border border-border/70 px-3 py-3">
            <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", example.color)}><Icon className="size-[18px]" aria-hidden="true" /></span>
            <div className="min-w-0 flex-1"><p className="truncate text-[13px] font-medium">{title}</p><p className="mt-1 truncate text-[11px] text-muted-foreground">{description}</p></div>
            <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
          </div>
        ))}
      </div>
      <p className="mt-6 text-center text-[10px] font-medium text-muted-foreground/70">mylink</p>
    </div>
  );
}

const features = [
  { number: "01", icon: Link2, title: "흩어진 링크를 한곳에", description: "SNS부터 포트폴리오, 블로그까지. 나를 보여주는 링크를 하나의 페이지에 담으세요.", color: "bg-primary/10 text-primary" },
  { number: "02", icon: Share2, title: "주소 하나로 간편하게", description: "내 아이디가 담긴 페이지 주소를 복사해 프로필이나 메시지에 공유하세요.", color: "bg-violet-100 text-violet-700 dark:bg-violet-400/15 dark:text-violet-300" },
  { number: "03", icon: ChartNoAxesCombined, title: "관심을 숫자로 확인", description: "총 클릭 수와 링크별 통계로 사람들이 어떤 링크에 관심을 보이는지 살펴보세요.", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300" },
];

export function LandingPage() {
  const [selectedExample, setSelectedExample] = useState(0);

  return (
    <main className="w-full overflow-x-clip">
      <section className="relative mx-auto grid w-full max-w-5xl items-center gap-12 px-6 pb-16 pt-12 sm:px-8 sm:pb-24 sm:pt-20 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:pb-28 lg:pt-24" aria-labelledby="hero-title">
        <div className="relative z-1 text-center lg:text-left">
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary"><span className="size-1.5 rounded-full bg-primary" />나를 소개하는 페이지, 생각보다 간단하게</p>
          <h1 id="hero-title" className="text-[clamp(2.5rem,7vw,3.75rem)] font-semibold leading-[1.16] tracking-[-0.055em]">나만의 링크 페이지를<br /><span className="text-primary">30분 만에.</span></h1>
          <p className="mx-auto mt-6 max-w-sm text-[15px] leading-7 text-muted-foreground lg:mx-0">프로필을 채우고, 나의 링크를 모으세요.<br className="hidden sm:block" /> 코딩 없이 나를 소개할 페이지가 완성돼요.</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 min-[400px]:flex-row lg:justify-start">
            <GoogleLoginButton className="h-12 w-full rounded-2xl border-primary bg-primary px-5 text-primary-foreground shadow-[0_8px_24px_-12px_var(--primary)] hover:bg-primary/90 hover:text-primary-foreground min-[400px]:w-auto dark:bg-primary dark:hover:bg-primary/90" />
            <a href="#preview" className="inline-flex h-12 items-center gap-2 rounded-2xl px-5 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40">미리 살펴보기<ArrowDown className="size-4" aria-hidden="true" /></a>
          </div>
          <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground lg:justify-start"><Check className="size-3.5 text-primary" aria-hidden="true" />Google 로그인으로 첫 단계부터 간편하게</p>
        </div>
        <div className="relative mx-auto w-full max-w-[360px] px-2 sm:px-0 lg:max-w-none lg:px-6">
          <div className="pointer-events-none absolute -inset-6 -z-10 rounded-full bg-primary/8 blur-3xl" aria-hidden="true" />
          <div className="relative sm:-rotate-3"><ExampleProfile /></div>
          <div className="relative ml-auto mt-4 flex w-fit items-center gap-3 rounded-2xl border border-border/60 bg-card px-4 py-3 shadow-[0_12px_35px_-16px_var(--primary)] sm:absolute sm:-right-5 sm:bottom-8 sm:mt-0">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><Share2 className="size-4" aria-hidden="true" /></span>
            <div><p className="text-xs font-semibold">공유는 주소 하나로</p><p className="mt-0.5 text-[11px] text-muted-foreground">나를 소개하는 작은 페이지</p></div>
          </div>
          <p className="mt-4 text-center text-[11px] text-muted-foreground sm:mt-10">예시 프로필 · 실제 페이지와 같은 구성</p>
        </div>
      </section>

      <section id="features" className="scroll-mt-24 border-y border-border/60 bg-muted/35" aria-labelledby="features-title">
        <div className="mx-auto max-w-5xl px-6 py-16 sm:px-8 sm:py-20">
          <div className="mb-9 max-w-md"><p className="text-xs font-medium text-primary">필요한 것만, 간결하게</p><h2 id="features-title" className="mt-3 text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">링크 관리는 가볍게.<br />나를 소개하는 일은 더 쉽게.</h2></div>
          <div className="grid gap-4 md:grid-cols-3">
            {features.map(({ number, icon: Icon, title, description, color }) => (
              <article key={number} className="rounded-[24px] border border-border/60 bg-card p-6 sm:p-7">
                <div className="flex items-center justify-between"><span className={cn("flex size-11 items-center justify-center rounded-2xl", color)}><Icon className="size-5" aria-hidden="true" /></span><span className="text-xs font-medium tabular-nums text-muted-foreground/60">{number}</span></div>
                <h3 className="mt-7 text-[17px] font-semibold tracking-tight">{title}</h3><p className="mt-3 text-sm leading-7 text-muted-foreground">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="preview" className="mx-auto grid max-w-5xl scroll-mt-20 items-center gap-10 px-6 py-16 sm:px-8 sm:py-24 lg:grid-cols-2 lg:gap-20" aria-labelledby="preview-title">
        <div>
          <p className="text-xs font-medium text-primary">내 페이지 미리보기</p>
          <h2 id="preview-title" className="mt-3 text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">어떤 나라도,<br />나답게 보여줄 수 있도록.</h2>
          <p className="mt-5 max-w-sm text-sm leading-7 text-muted-foreground">공유하고 싶은 것이 무엇이든 좋아요. 이름과 소개를 쓰고 링크를 담으면, 나를 소개할 준비가 끝나요.</p>
          <ol className="mt-8 space-y-5">
            {[
              ["프로필을 채우고", "이름과 짧은 소개로 나를 알려주세요."],
              ["링크를 모아서", "제목, 주소, 설명을 간단히 추가하세요."],
              ["내 주소를 공유하세요", "프로필에도, 메시지에도 주소 하나면 돼요."],
            ].map(([title, description], index) => <li key={title} className="flex items-start gap-3"><span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/8 text-xs font-semibold text-primary">{index + 1}</span><div><h3 className="pt-0.5 text-sm font-medium">{title}</h3><p className="mt-1 text-xs leading-6 text-muted-foreground">{description}</p></div></li>)}
          </ol>
        </div>
        <div className="mx-auto w-full max-w-[380px] min-w-0">
          <div className="mb-5 grid grid-cols-3 gap-1 rounded-2xl bg-muted p-1" role="group" aria-label="예시 프로필 선택">
            {examples.map((example, index) => <button key={example.handle} type="button" aria-pressed={selectedExample === index} onClick={() => setSelectedExample(index)} className={cn("min-h-10 rounded-xl px-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40", selectedExample === index ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>{example.label}</button>)}
          </div>
          <div aria-live="polite" aria-atomic="true"><p className="sr-only">{examples[selectedExample].role}의 예시 프로필</p><ExampleProfile index={selectedExample} /></div>
          <p className="mt-4 text-center text-[11px] text-muted-foreground">미리보기용 예시입니다. 나만의 내용으로 채워 보세요.</p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-16 sm:px-8 sm:pb-20" aria-labelledby="start-title">
        <div className="relative overflow-hidden rounded-[28px] border border-primary/10 bg-primary/5 px-5 py-12 text-center sm:px-10 sm:py-16">
          <span className="mx-auto mb-5 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><MousePointer2 className="size-5" aria-hidden="true" /></span>
          <h2 id="start-title" className="text-2xl font-semibold tracking-tight sm:text-3xl">오늘 30분, 나를 위한 페이지 하나.</h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">흩어진 링크를 모아, 바로 공유할 수 있는 나만의 페이지로.</p>
          <GoogleLoginButton className="mt-6 h-12 rounded-2xl border-primary bg-primary px-6 text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground dark:bg-primary dark:hover:bg-primary/90" />
        </div>
      </section>
      <footer className="border-t border-border/60"><div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-6 py-7 text-xs text-muted-foreground sm:flex-row sm:px-8"><a href="#hero-title" className="font-semibold tracking-tight text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40">mylink</a><p>나의 모든 링크를 한곳에.</p><a href="#preview" className="hover:text-foreground">페이지 미리보기<ArrowUpRight className="ml-1 inline size-3" aria-hidden="true" /></a></div></footer>
    </main>
  );
}
