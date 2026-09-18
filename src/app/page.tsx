"use client";

import Image from "next/image";
import { useState } from "react";

// 소셜 채널 데이터
const socialLinks = [
  {
    name: "GitHub",
    desc: "@jongcheon-baek",
    url: "https://github.com",
    bg: "bg-[#FFE600]",
    badge: "1.2k+ COMMITS",
    icon: (
      <svg className="h-6 w-6 text-black" fill="currentColor" viewBox="0 0 24 24">
        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
    ),
  },
  {
    name: "Tech Blog",
    desc: "기술 인사이트 & 개발 일지",
    url: "https://velog.io",
    bg: "bg-[#4ADE80]",
    badge: "32 POSTS",
    icon: (
      <svg className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    desc: "이력 및 커리어 네트워크",
    url: "https://linkedin.com",
    bg: "bg-[#70D6FF]",
    badge: "500+ NETWORK",
    icon: (
      <svg className="h-6 w-6 text-black" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.46 1.46 0 0 0 1.46-1.46c0-.81-.66-1.46-1.46-1.46a1.46 1.46 0 0 0-1.46 1.46c0 .8.66 1.46 1.46 1.46m1.39 9.74v-8.37H5.07v8.37h2.78z" />
      </svg>
    ),
  },
  {
    name: "Email",
    desc: "jongcheon.dev@example.com",
    url: "mailto:jongcheon.dev@example.com",
    bg: "bg-[#FF70A6]",
    badge: "QUICK REPLY",
    icon: (
      <svg className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
];

// 프로젝트 데이터
const projects = [
  {
    id: "linksphere",
    title: "LinkSphere (마이링크)",
    category: "WEB PLATFORM",
    badgeBg: "bg-[#4ADE80]",
    desc: "크리에이터와 개발자를 위한 모바일 최적화 스마트 링크 관리 및 실시간 방문 통계 분석 플랫폼입니다.",
    image: "/images/project-linksphere.svg",
    tags: ["Next.js 16", "TypeScript", "Tailwind CSS", "Supabase"],
    metrics: "⚡ SUB-50MS FAST LOAD",
    accent: "bg-[#FFE600]",
    demoUrl: "#",
    githubUrl: "#",
  },
  {
    id: "aidocu",
    title: "AI DocuFlow",
    category: "AI & AUTOMATION",
    badgeBg: "bg-[#FF70A6]",
    desc: "방대한 기술 문서와 PDF를 LLM 에이전트로 분석하여 핵심 인사이트 요약 및 액션 아이템을 자동 추출합니다.",
    image: "/images/project-aidocu.svg",
    tags: ["React 19", "FastAPI", "LangChain", "OpenAI"],
    metrics: "🤖 98.5% ACCURACY",
    accent: "bg-[#70D6FF]",
    demoUrl: "#",
    githubUrl: "#",
  },
  {
    id: "cloudmetrics",
    title: "CloudMetrics",
    category: "DEVOPS & METRICS",
    badgeBg: "bg-[#FFE600]",
    desc: "분산 마이크로서비스 클러스터의 RPS 트래픽과 지연시간을 실시간 웹소켓으로 시각화하는 모니터링 시스템입니다.",
    image: "/images/project-cloudmetrics.svg",
    tags: ["TypeScript", "WebSocket", "Docker", "Recharts"],
    metrics: "📊 14,000+ RPS / 99.9% LIVE",
    accent: "bg-[#FED7AA]",
    demoUrl: "#",
    githubUrl: "#",
  },
];

// 기술 스택 데이터
const skillsData = [
  {
    category: "FRONTEND ARSENAL",
    tagBg: "bg-[#FFE600]",
    borderBg: "border-black",
    items: [
      { name: "React 19", level: "EXPERT", color: "bg-[#70D6FF]" },
      { name: "Next.js 16", level: "EXPERT", color: "bg-[#FFFFFF]" },
      { name: "TypeScript", level: "ADVANCED", color: "bg-[#93C5FD]" },
      { name: "Tailwind CSS", level: "EXPERT", color: "bg-[#67E8F9]" },
      { name: "Zustand / Redux", level: "ADVANCED", color: "bg-[#FFD166]" },
      { name: "HTML5 / Canvas", level: "EXPERT", color: "bg-[#FCA5A5]" },
    ],
  },
  {
    category: "BACKEND & DATA",
    tagBg: "bg-[#70D6FF]",
    borderBg: "border-black",
    items: [
      { name: "Node.js", level: "ADVANCED", color: "bg-[#86EFAC]" },
      { name: "Express / Nest", level: "INTERMEDIATE", color: "bg-[#FFFFFF]" },
      { name: "Python / FastAPI", level: "INTERMEDIATE", color: "bg-[#FDE047]" },
      { name: "PostgreSQL", level: "ADVANCED", color: "bg-[#93C5FD]" },
      { name: "Prisma ORM", level: "ADVANCED", color: "bg-[#C4B5FD]" },
      { name: "Redis Cache", level: "INTERMEDIATE", color: "bg-[#FCA5A5]" },
    ],
  },
  {
    category: "DEVOPS & WORKFLOW",
    tagBg: "bg-[#FF70A6]",
    borderBg: "border-black",
    items: [
      { name: "Git & GitHub", level: "EXPERT", color: "bg-[#FFFFFF]" },
      { name: "Docker", level: "ADVANCED", color: "bg-[#70D6FF]" },
      { name: "Vercel Deploy", level: "ADVANCED", color: "bg-[#000000] text-white" },
      { name: "CI/CD Actions", level: "INTERMEDIATE", color: "bg-[#86EFAC]" },
      { name: "Figma UI/UX", level: "INTERMEDIATE", color: "bg-[#F472B6]" },
    ],
  },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<"all" | "projects" | "skills" | "about">("all");
  const [copyToast, setCopyToast] = useState(false);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopyToast(true);
      setTimeout(() => setCopyToast(false), 2500);
    }
  };

  return (
    <main className="min-h-screen bg-[#FFFDF5] text-black selection:bg-[#FFE600] selection:text-black">
      {/* ========================================================================= */}
      {/* 1. 최상단 네오브루탈리즘 마키 티커 배너 (Running Ticker) */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden border-b-4 border-black bg-[#FFE600] py-2 text-xs sm:text-sm font-black tracking-wider uppercase">
        <div className="animate-marquee whitespace-nowrap font-black">
          <span className="mx-4">⚡ BAEK JONGCHEON (백종천)</span>
          <span className="mx-4">● FULL STACK SOFTWARE ENGINEER</span>
          <span className="mx-4">● OPEN TO WORK &amp; COFFEE CHAT</span>
          <span className="mx-4">● NEXT.JS 16 &amp; REACT 19</span>
          <span className="mx-4">● 100% NEOBRUTALISM CRAFTED</span>
          <span className="mx-4">● BASED IN SEOUL, KOREA</span>
          <span className="mx-4">⚡ BAEK JONGCHEON (백종천)</span>
          <span className="mx-4">● FULL STACK SOFTWARE ENGINEER</span>
          <span className="mx-4">● OPEN TO WORK &amp; COFFEE CHAT</span>
          <span className="mx-4">● NEXT.JS 16 &amp; REACT 19</span>
          <span className="mx-4">● 100% NEOBRUTALISM CRAFTED</span>
          <span className="mx-4">● BASED IN SEOUL, KOREA</span>
        </div>
      </div>

      {/* 복사 완료 스티커 팝업 토스트 */}
      <div
        className={`fixed top-14 left-1/2 z-50 -translate-x-1/2 transform transition-all duration-200 ${
          copyToast
            ? "translate-y-0 opacity-100 scale-100"
            : "-translate-y-8 opacity-0 pointer-events-none scale-90"
        }`}
      >
        <div className="flex items-center gap-2 border-4 border-black bg-[#4ADE80] px-6 py-3 font-black text-black shadow-[6px_6px_0px_0px_#000]">
          <span className="text-lg">🎉</span>
          <span className="text-sm uppercase tracking-wide">
            COPIED! 프로필 링크가 복사되었습니다!
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 메인 컨테이너 */}
      {/* ========================================================================= */}
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        {/* ========================================================================= */}
        {/* 2. 레트로 OS 윈도우 스타일 히어로 카드 (Retro Window Hero Card) */}
        {/* ========================================================================= */}
        <section className="relative rounded-2xl border-4 border-black bg-white shadow-[8px_8px_0px_0px_#000] overflow-hidden">
          {/* OS 창 상단 타이틀 바 */}
          <div className="flex items-center justify-between border-b-4 border-black bg-[#FFE600] px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="h-4 w-4 rounded-full border-2 border-black bg-[#FF70A6]" />
              <span className="h-4 w-4 rounded-full border-2 border-black bg-[#70D6FF]" />
              <span className="h-4 w-4 rounded-full border-2 border-black bg-[#4ADE80]" />
              <span className="ml-2 font-mono text-xs sm:text-sm font-black tracking-wider text-black uppercase">
                jongcheon_profile.exe [ONLINE]
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span className="border-2 border-black bg-white px-2 py-0.5 font-mono text-[11px] font-black">
                TURBOPACK 16.3
              </span>
              <span className="border-2 border-black bg-black px-2 py-0.5 font-mono text-[11px] font-black text-white">
                v2.0
              </span>
            </div>
          </div>

          {/* 커버 배너 이미지 (네오브루탈리즘 스타일) */}
          <div className="relative h-44 w-full sm:h-56 md:h-64 border-b-4 border-black overflow-hidden bg-[#70D6FF]">
            <Image
              src="/images/banner.svg"
              alt="Neobrutalism Banner"
              fill
              priority
              className="object-cover"
            />
            {/* 회전 스티커 뱃지 */}
            <div className="absolute top-4 right-4 rotate-3 border-3 border-black bg-[#FF70A6] px-3.5 py-1.5 font-black text-xs text-black shadow-[4px_4px_0px_0px_#000]">
              🔥 AVAILABLE FOR HIRE
            </div>
          </div>

          {/* 프로필 정보 및 인터랙션 바 */}
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
              {/* 아바타 & 기본 신상 */}
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 -mt-20 sm:-mt-24 text-center sm:text-left">
                {/* 아바타 컨테이너 */}
                <div className="relative h-32 w-32 sm:h-36 sm:w-36 rounded-2xl border-4 border-black bg-[#FFE600] p-1 shadow-[6px_6px_0px_0px_#000]">
                  <div className="relative h-full w-full overflow-hidden rounded-xl bg-white">
                    <Image
                      src="/images/avatar.svg"
                      alt="백종천 아바타"
                      fill
                      priority
                      className="object-cover"
                    />
                  </div>
                  {/* 스탬프 뱃지 */}
                  <div className="absolute -bottom-3 -right-3 rotate-[-6deg] border-2 border-black bg-[#4ADE80] px-2 py-0.5 text-[10px] font-black uppercase shadow-[2px_2px_0px_0px_#000]">
                    VERIFIED ✓
                  </div>
                </div>

                {/* 이름 및 직책 */}
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-black">
                      백종천
                    </h1>
                    <span className="rounded-lg border-2 border-black bg-[#FED7AA] px-2 py-0.5 font-mono text-xs font-black">
                      JONGCHEON BAEK
                    </span>
                  </div>
                  <p className="font-mono text-sm sm:text-base font-black text-black">
                    🚀 FULL STACK SOFTWARE ENGINEER
                  </p>
                  <p className="inline-flex items-center gap-1.5 border-2 border-black bg-[#F4F4F0] px-2.5 py-1 text-xs font-black">
                    <span>📍</span> 서울, 대한민국 (SEOUL, KOREA)
                  </p>
                </div>
              </div>

              {/* 네오브루탈리즘 액션 버튼들 */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-2 border-3 border-black bg-[#FFE600] px-4 py-2.5 font-black text-xs uppercase shadow-[4px_4px_0px_0px_#000] transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  링크 복사
                </button>
                <a
                  href="mailto:jongcheon.dev@example.com"
                  className="flex items-center gap-2 border-3 border-black bg-[#FF70A6] px-5 py-2.5 font-black text-xs uppercase text-black shadow-[4px_4px_0px_0px_#000] transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  커피챗 요청하기
                </a>
              </div>
            </div>

            {/* 자기소개 스티커 블록 */}
            <div className="mt-8 border-t-4 border-black pt-6">
              <div className="relative rounded-xl border-3 border-black bg-[#FAF8F5] p-5 shadow-[4px_4px_0px_0px_#000]">
                {/* 상단 테이프 효과 */}
                <div className="absolute -top-3 left-8 h-6 w-20 border-2 border-black bg-[#FFE600]/80 rotate-[-4deg] opacity-90 shadow-xs" />
                <h3 className="font-mono text-xs font-black uppercase text-zinc-500">
                  // DEVELOPER STATEMENT
                </h3>
                <p className="mt-2 text-sm sm:text-base font-bold leading-relaxed text-black">
                  사용자 중심의 가치를 강렬하고 견고한 코드로 구축하는 풀스택 엔지니어입니다.
                  Next.js와 TypeScript 기반의 웹 프로덕트에서 빠른 실행력과 안정적인 시스템 아키텍처의 균형을 완성합니다.
                </p>
              </div>

              {/* 4대 핵심 지표 (Bold 4-Grid Counters) */}
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="overflow-hidden rounded-xl border-3 border-black bg-[#FFE600] p-3 sm:p-4 text-center shadow-[4px_4px_0px_0px_#000] transition-transform hover:-translate-y-1">
                  <div className="text-xl sm:text-3xl font-black text-black">3+</div>
                  <div className="mt-1 font-mono text-[11px] font-black uppercase text-black">
                    YEARS 경력
                  </div>
                </div>
                <div className="overflow-hidden rounded-xl border-3 border-black bg-[#70D6FF] p-3 sm:p-4 text-center shadow-[4px_4px_0px_0px_#000] transition-transform hover:-translate-y-1">
                  <div className="text-xl sm:text-3xl font-black text-black">18+</div>
                  <div className="mt-1 font-mono text-[11px] font-black uppercase text-black">
                    배포 프로젝트
                  </div>
                </div>
                <div className="overflow-hidden rounded-xl border-3 border-black bg-[#FF70A6] p-3 sm:p-4 text-center shadow-[4px_4px_0px_0px_#000] transition-transform hover:-translate-y-1">
                  <div className="text-xl sm:text-3xl font-black text-black">1,200+</div>
                  <div className="mt-1 font-mono text-[11px] font-black uppercase text-black">
                    연간 커밋
                  </div>
                </div>
                <div className="overflow-hidden rounded-xl border-3 border-black bg-[#4ADE80] p-3 sm:p-4 text-center shadow-[4px_4px_0px_0px_#000] transition-transform hover:-translate-y-1">
                  <div className="text-xl sm:text-3xl font-black text-black">99.9%</div>
                  <div className="mt-1 font-mono text-[11px] font-black uppercase text-black">
                    서비스 가용성
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. 폴더 탭 스타일 네비게이션 (Folder Tabs) */}
        {/* ========================================================================= */}
        <div className="mt-10 flex flex-wrap items-center gap-2 sm:gap-3">
          {(
            [
              { id: "all", label: "🗂️ ALL OVERVIEW", color: "bg-[#FFE600]" },
              { id: "projects", label: "💻 FEATURED PROJECTS", color: "bg-[#70D6FF]" },
              { id: "skills", label: "🛠️ TECH ARSENAL", color: "bg-[#4ADE80]" },
              { id: "about", label: "🔗 MY LINKS", color: "bg-[#FF70A6]" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`border-3 border-black px-4 py-2.5 font-mono text-xs sm:text-sm font-black uppercase transition-all ${
                activeTab === tab.id
                  ? `${tab.color} shadow-[4px_4px_0px_0px_#000] translate-x-[-1px] translate-y-[-1px]`
                  : "bg-white shadow-[2px_2px_0px_0px_#000] hover:bg-zinc-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ========================================================================= */}
        {/* 4. 소셜 & 마이링크 채널 (MyLinks Grid) */}
        {/* ========================================================================= */}
        {(activeTab === "all" || activeTab === "about") && (
          <section className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-mono text-base sm:text-lg font-black uppercase text-black">
                <span className="inline-block h-3.5 w-3.5 border-2 border-black bg-[#FFE600]" />
                MYLINK CHANNELS (공식 채널)
              </h2>
              <span className="font-mono text-xs font-black text-zinc-500 uppercase">
                [CLICK TO OPEN]
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {socialLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group relative flex flex-col justify-between rounded-xl border-3 border-black ${item.bg} p-4 shadow-[5px_5px_0px_0px_#000] transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[7px_7px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-black bg-white shadow-[2px_2px_0px_0px_#000]">
                      {item.icon}
                    </div>
                    <span className="border-2 border-black bg-white px-2 py-0.5 font-mono text-[10px] font-black">
                      {item.badge}
                    </span>
                  </div>

                  <div className="mt-4">
                    <h3 className="text-base font-black text-black group-hover:underline">
                      {item.name}
                    </h3>
                    <p className="font-mono text-xs font-bold text-black/80">
                      {item.desc}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t-2 border-black pt-2 font-mono text-xs font-black text-black">
                    <span>VISIT LINK</span>
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* 5. 주요 프로젝트 쇼케이스 (Featured Projects) */}
        {/* ========================================================================= */}
        {(activeTab === "all" || activeTab === "projects") && (
          <section className="mt-10">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="flex items-center gap-2 font-mono text-base sm:text-lg font-black uppercase text-black">
                  <span className="inline-block h-3.5 w-3.5 border-2 border-black bg-[#70D6FF]" />
                  FEATURED WORK (주요 프로젝트)
                </h2>
                <p className="mt-1 font-mono text-xs font-bold text-zinc-600">
                  직접 아키텍처를 설계하고 완성한 핵심 프로덕트 포트폴리오
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <article
                  key={project.id}
                  className="group flex flex-col rounded-2xl border-4 border-black bg-white shadow-[6px_6px_0px_0px_#000] transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_#000] overflow-hidden"
                >
                  {/* 상단 프로젝트 카테고리 바 */}
                  <div className="flex items-center justify-between border-b-3 border-black bg-[#F4F4F0] px-4 py-2">
                    <span className="font-mono text-xs font-black uppercase">
                      {project.title.split(" ")[0]}
                    </span>
                    <span className={`border-2 border-black ${project.badgeBg} px-2 py-0.5 font-mono text-[10px] font-black`}>
                      {project.category}
                    </span>
                  </div>

                  {/* 프로젝트 프리뷰 그래픽 이미지 */}
                  <div className="relative aspect-[16/9] w-full border-b-3 border-black bg-[#FFFDF5]">
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* 본문 정보 */}
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="text-lg font-black text-black">
                      {project.title}
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm font-semibold leading-relaxed text-zinc-700 line-clamp-2">
                      {project.desc}
                    </p>

                    {/* 성과 뱃지 */}
                    <div className="mt-3 inline-block self-start border-2 border-black bg-[#FFFDF5] px-2.5 py-1 font-mono text-xs font-black text-black">
                      {project.metrics}
                    </div>

                    {/* 기술 스택 칩스 */}
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="border-2 border-black bg-[#F4F4F0] px-2 py-0.5 font-mono text-[10px] font-black text-black"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* 하단 링크 버튼 */}
                    <div className="mt-5 flex items-center gap-2 border-t-3 border-black pt-4">
                      <a
                        href={project.demoUrl}
                        className="flex-1 rounded-lg border-2 border-black bg-[#FFE600] py-2 text-center font-mono text-xs font-black uppercase shadow-[2px_2px_0px_0px_#000] transition-all hover:bg-yellow-300 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                      >
                        LIVE DEMO ↗
                      </a>
                      <a
                        href={project.githubUrl}
                        className="rounded-lg border-2 border-black bg-white px-3 py-2 font-mono text-xs font-black uppercase shadow-[2px_2px_0px_0px_#000] hover:bg-zinc-100 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                      >
                        CODE
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* 6. 기술 스택 아스날 (Sticker Pack Arsenal) */}
        {/* ========================================================================= */}
        {(activeTab === "all" || activeTab === "skills") && (
          <section className="mt-10">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-mono text-base sm:text-lg font-black uppercase text-black">
                <span className="inline-block h-3.5 w-3.5 border-2 border-black bg-[#4ADE80]" />
                TECHNICAL ARSENAL (기술 스택)
              </h2>
              <span className="font-mono text-xs font-black text-zinc-500 uppercase">
                [SKILL MATRIX]
              </span>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {skillsData.map((category) => (
                <div
                  key={category.category}
                  className="rounded-2xl border-4 border-black bg-white p-5 shadow-[6px_6px_0px_0px_#000]"
                >
                  <div className={`mb-4 inline-block border-2 border-black ${category.tagBg} px-3 py-1 font-mono text-xs font-black uppercase shadow-[2px_2px_0px_0px_#000]`}>
                    {category.category}
                  </div>

                  <div className="flex flex-col gap-2.5">
                    {category.items.map((skill) => (
                      <div
                        key={skill.name}
                        className="flex items-center justify-between rounded-lg border-2 border-black bg-[#F8FAFC] px-3 py-2 shadow-[2px_2px_0px_0px_#000] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5"
                      >
                        <span className="font-bold text-xs text-black">
                          {skill.name}
                        </span>
                        <span
                          className={`rounded border-2 border-black px-1.5 py-0.5 font-mono text-[9px] font-black uppercase ${skill.color}`}
                        >
                          {skill.level}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* 7. 하단 콜투액션 (Neobrutalism Bulletin Banner) */}
        {/* ========================================================================= */}
        <section className="relative mt-12 rounded-2xl border-4 border-black bg-[#FFE600] p-8 sm:p-10 shadow-[8px_8px_0px_0px_#000] text-center overflow-hidden">
          {/* 회전 스티커 장식 */}
          <div className="absolute -top-3 right-8 rotate-12 border-3 border-black bg-[#FF70A6] px-3 py-1 font-mono text-xs font-black shadow-[3px_3px_0px_0px_#000]">
            ★ LET&apos;S TALK!
          </div>

          <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-black">
            LET&apos;S BUILD SOMETHING AUDACIOUS!
          </h2>
          <p className="mx-auto mt-3 max-w-xl font-bold text-xs sm:text-sm text-black">
            새로운 프로덕트 개발, 프론트엔드/풀스택 엔지니어링 협업, 가벼운 커피챗 등 언제든 환영합니다.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <a
              href="mailto:jongcheon.dev@example.com"
              className="border-3 border-black bg-[#4ADE80] px-6 py-3 font-mono text-xs sm:text-sm font-black uppercase text-black shadow-[4px_4px_0px_0px_#000] transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            >
              📬 이메일 문의하기 (SEND MESSAGE)
            </a>
            <button
              onClick={handleCopyLink}
              className="border-3 border-black bg-white px-6 py-3 font-mono text-xs sm:text-sm font-black uppercase text-black shadow-[4px_4px_0px_0px_#000] transition-all hover:bg-zinc-100 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            >
              ⚡ 프로필 주소 복사 (COPY)
            </button>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 8. 푸터 (Neobrutalism Footer) */}
        {/* ========================================================================= */}
        <footer className="mt-12 border-t-4 border-black pt-6 text-center font-mono text-xs font-black text-black">
          <p>© 2026 BAEK JONGCHEON. ALL RIGHTS RESERVED.</p>
          <p className="mt-1 text-[11px] text-zinc-600">
            DESIGNED IN PURE NEOBRUTALISM ● BUILT WITH NEXT.JS 16 &amp; TAILWIND CSS
          </p>
        </footer>
      </div>
    </main>
  );
}
