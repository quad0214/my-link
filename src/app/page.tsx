"use client";

import Image from "next/image";
import { useState } from "react";

// 소셜 링크 데이터
const socialLinks = [
  {
    name: "GitHub",
    desc: "@jongcheon-baek",
    url: "https://github.com",
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
    ),
    badge: "1.2k Commits",
    color: "hover:text-zinc-900 dark:hover:text-white hover:border-zinc-400 dark:hover:border-zinc-600",
  },
  {
    name: "Tech Blog",
    desc: "기술 인사이트 & 개발 일지",
    url: "https://velog.io",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
      </svg>
    ),
    badge: "32 Posts",
    color: "hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-300 dark:hover:border-emerald-800",
  },
  {
    name: "LinkedIn",
    desc: "이력 및 커리어 네트워크",
    url: "https://linkedin.com",
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.46 1.46 0 0 0 1.46-1.46c0-.81-.66-1.46-1.46-1.46a1.46 1.46 0 0 0-1.46 1.46c0 .8.66 1.46 1.46 1.46m1.39 9.74v-8.37H5.07v8.37h2.78z" />
      </svg>
    ),
    badge: "500+ Connections",
    color: "hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-800",
  },
  {
    name: "Email",
    desc: "jongcheon.dev@example.com",
    url: "mailto:jongcheon.dev@example.com",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    badge: "빠른 회신",
    color: "hover:text-amber-600 dark:hover:text-amber-400 hover:border-amber-300 dark:hover:border-amber-800",
  },
];

// 프로젝트 데이터
const projects = [
  {
    id: "linksphere",
    title: "LinkSphere (마이링크)",
    category: "Web Platform",
    desc: "크리에이터와 개발자를 위한 모바일 최적화 스마트 링크 관리 및 실시간 방문 통계 분석 플랫폼입니다.",
    image: "/images/project-linksphere.svg",
    tags: ["Next.js 16", "TypeScript", "Tailwind CSS", "Supabase"],
    metrics: "실시간 반응형 UI & 초고속 로딩",
    demoUrl: "#",
    githubUrl: "#",
    featured: true,
  },
  {
    id: "aidocu",
    title: "AI DocuFlow",
    category: "AI & Automation",
    desc: "방대한 기술 문서와 PDF를 LLM 에이전트로 분석하여 핵심 인사이트 요약 및 액션 아이템을 자동 추출합니다.",
    image: "/images/project-aidocu.svg",
    tags: ["React", "FastAPI", "LangChain", "OpenAI"],
    metrics: "문서 요약 정확도 98.5%",
    demoUrl: "#",
    githubUrl: "#",
    featured: true,
  },
  {
    id: "cloudmetrics",
    title: "CloudMetrics",
    category: "DevOps & Monitoring",
    desc: "분산 마이크로서비스 클러스터의 RPS 트래픽과 지연시간을 실시간 웹소켓으로 시각화하는 모니터링 시스템입니다.",
    image: "/images/project-cloudmetrics.svg",
    tags: ["TypeScript", "WebSocket", "Docker", "Recharts"],
    metrics: "초당 14,000건 처리 & 99.9% 가용성",
    demoUrl: "#",
    githubUrl: "#",
    featured: false,
  },
];

// 기술 스택 데이터
const skillsData = [
  {
    category: "Frontend",
    items: [
      { name: "React 19", level: "Expert" },
      { name: "Next.js 16", level: "Expert" },
      { name: "TypeScript", level: "Advanced" },
      { name: "Tailwind CSS", level: "Expert" },
      { name: "Zustand / Redux", level: "Advanced" },
      { name: "HTML5 / CSS3", level: "Expert" },
    ],
  },
  {
    category: "Backend & DB",
    items: [
      { name: "Node.js", level: "Advanced" },
      { name: "Express / NestJS", level: "Intermediate" },
      { name: "Python / FastAPI", level: "Intermediate" },
      { name: "PostgreSQL", level: "Advanced" },
      { name: "Prisma ORM", level: "Advanced" },
      { name: "Redis", level: "Intermediate" },
    ],
  },
  {
    category: "DevOps & Tools",
    items: [
      { name: "Git & GitHub", level: "Expert" },
      { name: "Docker", level: "Advanced" },
      { name: "Vercel / Cloudflare", level: "Advanced" },
      { name: "CI / CD Actions", level: "Intermediate" },
      { name: "Figma", level: "Intermediate" },
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
    <main className="min-h-screen bg-zinc-50 text-zinc-900 transition-colors duration-300 dark:bg-zinc-950 dark:text-zinc-100">
      {/* 알림 토스트 (링크 복사 완료) */}
      <div
        className={`fixed top-6 left-1/2 z-50 -translate-x-1/2 transform transition-all duration-300 ${
          copyToast
            ? "translate-y-0 opacity-100 scale-100"
            : "-translate-y-4 opacity-0 pointer-events-none scale-95"
        }`}
      >
        <div className="flex items-center gap-2.5 rounded-full bg-zinc-900/90 px-5 py-2.5 text-sm font-medium text-white shadow-xl backdrop-blur-md ring-1 ring-white/20 dark:bg-white/90 dark:text-zinc-900">
          <svg className="h-4 w-4 text-emerald-400 dark:text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          <span>프로필 링크가 클립보드에 복사되었습니다! 🎉</span>
        </div>
      </div>

      {/* 배경 앰비언트 글로우 데코레이션 */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-blue-500/15 to-violet-500/15 blur-3xl dark:from-blue-600/10 dark:to-purple-600/15" />
        <div className="absolute top-1/3 -right-20 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl dark:bg-cyan-500/5" />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* ========================================================================= */}
        {/* 상단 프로필 헤더 카드 (Cover + Avatar + Bio + Quick Actions) */}
        {/* ========================================================================= */}
        <section className="relative overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-zinc-200/80 transition-all dark:bg-zinc-900/90 dark:ring-zinc-800">
          {/* 커버 배너 이미지 */}
          <div className="relative h-44 w-full sm:h-56 md:h-64 overflow-hidden bg-gradient-to-r from-blue-900 via-indigo-950 to-purple-950">
            <Image
              src="/images/banner.svg"
              alt="프로필 커버 배경"
              fill
              priority
              className="object-cover opacity-90 transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            
            {/* 상태 뱃지 (우측 상단) */}
            <div className="absolute top-4 right-4 flex items-center gap-2 rounded-full bg-black/40 px-3.5 py-1.5 text-xs font-medium text-white backdrop-blur-md ring-1 ring-white/20">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              새로운 프로젝트 & 커피챗 환영
            </div>
          </div>

          {/* 프로필 정보 영역 */}
          <div className="relative px-6 pb-8 pt-0 sm:px-10">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between">
              {/* 아바타 이미지 & 기본 타이틀 */}
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 -mt-16 sm:-mt-20 text-center sm:text-left">
                {/* 아바타 컨테이너 */}
                <div className="group relative h-28 w-28 sm:h-36 sm:w-36 rounded-full p-1.5 bg-white ring-4 ring-white shadow-xl dark:bg-zinc-900 dark:ring-zinc-900">
                  <div className="relative h-full w-full overflow-hidden rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600">
                    <Image
                      src="/images/avatar.svg"
                      alt="백종천 프로필 사진"
                      fill
                      priority
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  {/* 작은 인증 뱃지 */}
                  <div className="absolute bottom-1 right-1 flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white shadow-md ring-2 ring-white dark:ring-zinc-900" title="공식 인증 프로필">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>

                {/* 이름 및 역할 */}
                <div className="space-y-1 sm:mb-2">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-white">
                      백종천
                    </h1>
                    <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                      (Jongcheon Baek)
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-blue-600 sm:text-base dark:text-blue-400">
                    Full Stack Software Engineer & Web Creator
                  </p>
                  <p className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                    <svg className="h-3.5 w-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    서울, 대한민국 (Seoul, KR)
                  </p>
                </div>
              </div>

              {/* 액션 버튼 그룹 */}
              <div className="mt-6 sm:mt-0 flex flex-wrap items-center justify-center gap-2.5">
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-1.5 rounded-xl bg-zinc-100 px-4 py-2.5 text-xs font-semibold text-zinc-700 transition-all hover:bg-zinc-200 active:scale-95 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  링크 공유
                </button>
                <a
                  href="mailto:jongcheon.dev@example.com"
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm shadow-blue-500/20 transition-all hover:bg-blue-700 hover:shadow-md active:scale-95 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  커피챗 요청하기
                </a>
              </div>
            </div>

            {/* 한 줄 소개 & 핵심 지표 요약 바 */}
            <div className="mt-6 border-t border-zinc-100 pt-6 dark:border-zinc-800/80">
              <p className="text-sm sm:text-base leading-relaxed text-zinc-600 dark:text-zinc-300">
                사용자 중심의 가치를 간결하고 견고한 코드로 구현하는 개발자입니다. 
                Next.js, TypeScript 생태계에서 직관적인 인터페이스와 효율적인 시스템 아키텍처를 설계하는 것을 즐깁니다.
              </p>

              {/* 통계 지표 하이라이트 */}
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-2xl bg-zinc-50/80 p-3.5 text-center ring-1 ring-zinc-200/50 dark:bg-zinc-800/50 dark:ring-zinc-700/50">
                  <div className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white">3+ 년</div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">개발 경력</div>
                </div>
                <div className="rounded-2xl bg-zinc-50/80 p-3.5 text-center ring-1 ring-zinc-200/50 dark:bg-zinc-800/50 dark:ring-zinc-700/50">
                  <div className="text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-400">18+ 개</div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">배포 프로젝트</div>
                </div>
                <div className="rounded-2xl bg-zinc-50/80 p-3.5 text-center ring-1 ring-zinc-200/50 dark:bg-zinc-800/50 dark:ring-zinc-700/50">
                  <div className="text-lg sm:text-xl font-bold text-violet-600 dark:text-violet-400">1,200+</div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">연간 커밋</div>
                </div>
                <div className="rounded-2xl bg-zinc-50/80 p-3.5 text-center ring-1 ring-zinc-200/50 dark:bg-zinc-800/50 dark:ring-zinc-700/50">
                  <div className="text-lg sm:text-xl font-bold text-emerald-600 dark:text-emerald-400">99.9%</div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">서비스 안정성</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 필터 탭 네비게이션 */}
        {/* ========================================================================= */}
        <div className="mt-8 flex items-center justify-center sm:justify-start gap-1.5 overflow-x-auto rounded-2xl bg-zinc-200/60 p-1.5 backdrop-blur-sm dark:bg-zinc-900/80 dark:ring-1 dark:ring-zinc-800">
          {(
            [
              { id: "all", label: "전체 보기" },
              { id: "projects", label: "주요 프로젝트" },
              { id: "skills", label: "기술 스택" },
              { id: "about", label: "채널 & 소셜" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-white"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ========================================================================= */}
        {/* 소셜 & 마이링크 빠른 바로가기 그리드 */}
        {/* ========================================================================= */}
        {(activeTab === "all" || activeTab === "about") && (
          <section className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-blue-500" />
                연결된 채널 (MyLinks)
              </h2>
              <span className="text-xs text-zinc-500">클릭하여 바로 이동</span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {socialLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group relative flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200/80 transition-all duration-200 hover:-translate-y-1 hover:shadow-md dark:bg-zinc-900 dark:ring-zinc-800 ${item.color}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700 transition-colors group-hover:bg-blue-50 group-hover:text-blue-600 dark:bg-zinc-800 dark:text-zinc-300 dark:group-hover:bg-zinc-700">
                      {item.icon}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-zinc-900 dark:text-white">
                        {item.name}
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">
                        {item.desc}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <svg className="h-4 w-4 text-zinc-400 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* 주요 프로젝트 섹션 (이미지 카드 포함 & 반응형 그리드) */}
        {/* ========================================================================= */}
        {(activeTab === "all" || activeTab === "projects") && (
          <section className="mt-10">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-violet-500" />
                  주요 프로젝트 (Featured Projects)
                </h2>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  직접 설계하고 개발한 실무 및 사이드 프로젝트 모음입니다.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <article
                  key={project.id}
                  className="group flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-zinc-200/80 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl dark:bg-zinc-900 dark:ring-zinc-800"
                >
                  {/* 프로젝트 프리뷰 이미지 */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-zinc-950">
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
                      {project.category}
                    </div>
                  </div>

                  {/* 프로젝트 본문 */}
                  <div className="flex flex-1 flex-col p-5 sm:p-6">
                    <h3 className="text-base font-bold text-zinc-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                      {project.title}
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm leading-relaxed text-zinc-600 line-clamp-2 dark:text-zinc-400">
                      {project.desc}
                    </p>

                    {/* 핵심 성과/지표 */}
                    <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      <span>{project.metrics}</span>
                    </div>

                    {/* 기술 스택 뱃지 태그 */}
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-lg bg-zinc-100 px-2.5 py-1 text-[11px] font-medium text-zinc-600 dark:bg-zinc-800/80 dark:text-zinc-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* 하단 링크 버튼 */}
                    <div className="mt-5 flex items-center gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
                      <a
                        href={project.demoUrl}
                        className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        라이브 데모
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                      <span className="text-zinc-300 dark:text-zinc-700">•</span>
                      <a
                        href={project.githubUrl}
                        className="text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                      >
                        GitHub 코드
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* 기술 스택 섹션 */}
        {/* ========================================================================= */}
        {(activeTab === "all" || activeTab === "skills") && (
          <section className="mt-10">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                전문 기술 스택 (Technical Arsenal)
              </h2>
              <span className="text-xs text-zinc-500">실무 역량 중심</span>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {skillsData.map((category) => (
                <div
                  key={category.category}
                  className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-zinc-200/80 dark:bg-zinc-900 dark:ring-zinc-800"
                >
                  <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    {category.category}
                  </h3>
                  <div className="mt-4 flex flex-col gap-2.5">
                    {category.items.map((skill) => (
                      <div
                        key={skill.name}
                        className="flex items-center justify-between rounded-xl bg-zinc-50 px-3.5 py-2 text-xs font-medium text-zinc-800 transition-colors hover:bg-zinc-100 dark:bg-zinc-800/60 dark:text-zinc-200 dark:hover:bg-zinc-800"
                      >
                        <span className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                          {skill.name}
                        </span>
                        <span className="rounded-md bg-white px-2 py-0.5 text-[10px] font-semibold text-zinc-500 shadow-2xs dark:bg-zinc-900 dark:text-zinc-400">
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
        {/* 하단 커피챗 & 연락 제안 배너 */}
        {/* ========================================================================= */}
        <section className="mt-12 overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-center text-white shadow-lg sm:p-10">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            함께 멋진 가치를 만들어갈 준비가 되셨나요?
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-xs sm:text-sm text-blue-100">
            새로운 프로덕트 개발, 기술 협업, 가벼운 커피챗 등 어떤 이야기든 환영합니다.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <a
              href="mailto:jongcheon.dev@example.com"
              className="rounded-xl bg-white px-5 py-3 text-xs sm:text-sm font-bold text-blue-700 shadow-sm transition-all hover:bg-blue-50 active:scale-95"
            >
              이메일로 메시지 보내기
            </a>
            <button
              onClick={handleCopyLink}
              className="rounded-xl bg-blue-800/40 px-5 py-3 text-xs sm:text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-blue-800/60 active:scale-95 ring-1 ring-white/20"
            >
              마이링크 주소 복사
            </button>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 푸터 */}
        {/* ========================================================================= */}
        <footer className="mt-12 border-t border-zinc-200/80 pt-6 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          <p>© 2026 Baek Jongcheon. All rights reserved.</p>
          <p className="mt-1 text-[11px] text-zinc-400 dark:text-zinc-500">
            Crafted with Next.js 16, React 19, TypeScript & Tailwind CSS
          </p>
        </footer>
      </div>
    </main>
  );
}
