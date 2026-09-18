"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

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

const tabs = [
  { id: "links", label: "내 링크", count: "04" },
  { id: "projects", label: "프로젝트", count: "03" },
  { id: "skills", label: "기술 스택", count: "17" },
] as const;

type Tab = (typeof tabs)[number]["id"];

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("links");
  const [notice, setNotice] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  async function handleCopyLink() {
    if (timer.current) clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(window.location.href);
      setNotice("프로필 링크를 복사했어요.");
    } catch {
      setNotice("복사하지 못했어요. 브라우저 주소창에서 링크를 복사해 주세요.");
    }
    timer.current = setTimeout(() => setNotice(""), 4000);
  }

  return (
    <main className="profile-page">
      <div className="page-shell">
        <header className="site-header">
          <Link className="wordmark" href="/" aria-label="MyLink 홈"><span aria-hidden="true">↗</span> mylink<span className="wordmark-dot">.</span></Link>
          <span className="header-note">작은 연결, 새로운 가능성</span>
        </header>

        <div className="profile-layout">
          <section className="profile-card" aria-labelledby="profile-name">
            <div className="profile-cover"><span className="availability"><span /> 새로운 기회에 열려 있어요</span><span className="cover-orbit" aria-hidden="true" /></div>
            <div className="profile-body">
              <div className="avatar" aria-label="백종천 이니셜">JB<span aria-hidden="true">✦</span></div>
              <p className="eyebrow">HELLO, I’M</p>
              <h1 id="profile-name">백종천 <span>Jongcheon Baek</span></h1>
              <p className="role">Full Stack Software Engineer</p>
              <p className="location"><span aria-hidden="true">◎</span> Seoul, Korea</p>
              <p className="bio">아이디어를 쓸모 있는 제품으로.<br />사용자 중심의 가치를 코드로 만드는<br className="desktop-break" /> 풀스택 개발자입니다.</p>
              <div className="profile-tags"><span>Next.js</span><span>TypeScript</span><span>React</span></div>
              <div className="profile-stats">
                <div><strong>3<span>+</span></strong><span>개발 경력</span></div>
                <div><strong>18<span>+</span></strong><span>배포 프로젝트</span></div>
                <div><strong>1.2k<span>+</span></strong><span>연간 커밋</span></div>
              </div>
              <a className="primary-button" href="mailto:jongcheon.dev@example.com">커피챗 요청하기 <span aria-hidden="true">↗</span></a>
              <button className="secondary-button" onClick={handleCopyLink}><span aria-hidden="true">⧉</span> 프로필 링크 복사</button>
            </div>
          </section>

          <section className="content-card" aria-label="프로필 상세">
            <div className="content-heading"><p className="eyebrow">A LITTLE MORE ABOUT ME</p><h2>저의 일과 이야기를 만나보세요<span>.</span></h2><p>만들고, 배우고, 나누는 모든 것을 한곳에.</p></div>
            <div className="tabs" role="tablist" aria-label="프로필 카테고리">
              {tabs.map((tab, index) => <button key={tab.id} id={`tab-${tab.id}`} role="tab" aria-selected={activeTab === tab.id} aria-controls={`panel-${tab.id}`} tabIndex={activeTab === tab.id ? 0 : -1} onClick={() => setActiveTab(tab.id)} onKeyDown={(event) => {
                const next = event.key === "ArrowRight" ? (index + 1) % tabs.length : event.key === "ArrowLeft" ? (index + tabs.length - 1) % tabs.length : event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : -1;
                if (next >= 0) { event.preventDefault(); setActiveTab(tabs[next].id); document.getElementById(`tab-${tabs[next].id}`)?.focus(); }
              }}>{tab.label}<span>{tab.count}</span></button>)}
            </div>

            <div className="tab-content" id={`panel-${activeTab}`} role="tabpanel" aria-labelledby={`tab-${activeTab}`} tabIndex={0}>
              {activeTab === "links" && <>
                <div className="section-caption"><h3>온라인에서 만나요</h3><span>LET’S CONNECT</span></div>
                <div className="link-list">{socialLinks.map((link) => <a key={link.name} className="link-card" href={link.url} target={link.url.startsWith("mailto:") ? undefined : "_blank"} rel="noopener noreferrer"><span className="link-icon" aria-hidden="true">{link.icon}</span><span className="link-copy"><strong>{link.name}</strong><span>{link.desc}</span></span><span className="link-arrow" aria-hidden="true">↗</span></a>)}</div>
                <div className="small-note"><span aria-hidden="true">✦</span><p>좋은 제품은 좋은 대화에서 시작되니까요.<br /><strong>함께할 재미있는 일이 있다면 편하게 연락해 주세요.</strong></p></div>
              </>}
              {activeTab === "projects" && <>
                <div className="section-caption"><h3>직접 만든 프로덕트</h3><span>SELECTED WORK</span></div>
                <div className="project-list">{projects.map((project, index) => <article key={project.id} className="project-card"><span className="project-number">0{index + 1}</span><div><span className="project-category">{project.category}</span><h3>{project.title}</h3><p>{project.desc}</p><div className="project-tags">{project.tags.map(tag => <span key={tag}>{tag}</span>)}</div></div></article>)}</div>
              </>}
              {activeTab === "skills" && <>
                <div className="section-caption"><h3>아이디어를 구현하는 도구</h3><span>MY TOOLKIT</span></div>
                <div className="skill-list">{skillsData.map(category => <article className="skill-card" key={category.category}><h3>{category.category.replace(" ARSENAL", "")}</h3><div>{category.items.map(skill => <span key={skill.name} title={skill.level}>{skill.name}</span>)}</div></article>)}</div>
              </>}
            </div>
            <div className="content-footer"><span className="status-dot" /> 꾸준히 배우고, 더 나은 것을 만듭니다.<span aria-hidden="true">✧</span></div>
          </section>
        </div>
        <footer className="site-footer"><span>© 2026 Jongcheon Baek</span><span>Made with care · <strong>mylink.</strong></span></footer>
      </div>
      <div className={`toast ${notice ? "visible" : ""}`} role="status" aria-live="polite">{notice}</div>
    </main>
  );
}
