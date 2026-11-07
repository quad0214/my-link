import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import type { LinkBlock, Profile } from "@/types/profile";

const font = readFile(join(process.cwd(), "src/assets/fonts/Pretendard-SemiBold.woff"));
const blue = "#2878ed";
const ink = "#192334";

type ImageData = { profile: Profile; links: LinkBlock[] };

function shorten(value: string, length: number) {
  const characters = Array.from(value.trim().replace(/\s+/g, " "));
  return characters.length > length ? characters.slice(0, length - 1).join("") + "…" : characters.join("");
}

async function avatarData(url: string | null) {
  if (!url) return null;
  try {
    const source = new URL(url);
    // Google sign-in supplies these avatars. Never fetch arbitrary user URLs
    // (including private network addresses) from the image renderer.
    if (source.protocol !== "https:" || source.port || source.username || source.password ||
      !source.hostname.endsWith(".googleusercontent.com")) return null;
    const response = await fetch(source, {
      signal: AbortSignal.timeout(2500), redirect: "error", cache: "no-store",
    });
    const type = response.headers.get("content-type")?.split(";")[0];
    if (!response.ok || !type || !["image/png", "image/jpeg"].includes(type)) return null;
    const reader = response.body?.getReader();
    if (!reader) return null;
    const chunks: Uint8Array[] = [];
    let length = 0;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        length += value.byteLength;
        if (length > 2 * 1024 * 1024) return null;
        chunks.push(value);
      }
    } finally {
      await reader.cancel();
    }
    return `data:${type};base64,${Buffer.concat(chunks).toString("base64")}`;
  } catch {
    return null;
  }
}

function Arrow({ color = blue }: { color?: string }) {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M5 19 19 5M5 5h14v14" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export async function createOgImage(data?: ImageData) {
  const avatar = data ? await avatarData(data.profile.avatarUrl) : null;
  const name = data ? shorten(data.profile.username, 26) : "나의 모든 링크를";
  const links = data ? data.links.slice(0, 3).map((link) => ({ title: shorten(link.title, 13), detail: shorten(link.description || new URL(link.url).hostname, 18) })) : [
    { title: "나의 포트폴리오", detail: "좋아하는 일, 만들어 온 것들" },
    { title: "일상을 기록하는 블로그", detail: "생각과 이야기가 쌓이는 곳" },
    { title: "나의 소셜 채널", detail: "조금 더 가까이 연결돼요" },
  ];

  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#f8faff", color: ink, fontFamily: "Pretendard", padding: "44px 56px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", width: 650, height: 650, borderRadius: 400, right: -200, top: -200, background: "#e8f0ff" }} />
      <div style={{ position: "absolute", width: 380, height: 380, borderRadius: 300, left: -170, bottom: -280, background: "#dceaff" }} />
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ display: "flex", width: 40, height: 40, borderRadius: 14, background: blue, color: "white", alignItems: "center", justifyContent: "center", fontSize: 25 }}>M</div>
        <span style={{ fontSize: 26, letterSpacing: -1 }}>mylink</span>
      </div>
      <div style={{ display: "flex", flex: 1, gap: 48, alignItems: "center", marginTop: 12 }}>
        <div style={{ display: "flex", flexDirection: "column", width: 596 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            {data ? <div style={{ display: "flex", width: 76, height: 76, borderRadius: 24, overflow: "hidden", background: "#e4edff", color: blue, alignItems: "center", justifyContent: "center", fontSize: 36 }}>
              {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse renders embedded pixels. */}
              {avatar ? <img src={avatar} width={76} height={76} alt="" style={{ objectFit: "cover" }} /> : Array.from(data.profile.username)[0] || "M"}
            </div> : null}
            <div style={{ display: "flex", padding: "9px 16px", borderRadius: 30, background: "#eaf1ff", color: blue, fontSize: 18 }}>{data ? `@${data.profile.displayname}` : "나를 연결하는 가장 쉬운 방법"}</div>
          </div>
          <div style={{ display: "flex", fontSize: data ? (Array.from(name).length > 18 ? 45 : 58) : 58, letterSpacing: -2, lineHeight: 1.25, wordBreak: "break-all" }}>{name}</div>
          <div style={{ display: "flex", color: blue, fontSize: data ? 36 : 58, marginTop: 6, letterSpacing: -1.5 }}>{data ? "하나의 링크로 만나요." : "한곳에, 나답게."}</div>
          <div style={{ display: "flex", fontSize: 23, lineHeight: 1.65, color: "#647086", marginTop: 23, wordBreak: "break-all" }}>{data ? shorten(data.profile.bio || "나의 다양한 이야기를 링크로 만나보세요.", 88) : "프로필부터 포트폴리오, SNS까지.\n나의 모든 이야기를 하나의 링크로 공유하세요."}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", width: 396, padding: 26, borderRadius: 32, background: "white", border: "1px solid #e1e9f6", boxShadow: "0 16px 48px rgba(40, 90, 170, 0.09)", transform: "rotate(-3deg)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
            <span style={{ fontSize: 17, color: "#778399", letterSpacing: 2 }}>MY LINKS</span>
            <span style={{ color: blue, fontSize: 17 }}>{data ? `${data.links.length}개의 연결` : "나만의 작은 공간"}</span>
          </div>
          {links.map((link, index) => <div key={index} style={{ display: "flex", alignItems: "center", height: 96, padding: "14px 16px", marginBottom: index < links.length - 1 ? 12 : 0, gap: 14, border: "1px solid #e5ebf5", borderRadius: 20, background: index === 0 ? "#f3f7ff" : "#ffffff" }}>
            <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: 20, lineHeight: 1.4, wordBreak: "break-all" }}>{link.title}</span>
              <span style={{ fontSize: 14, color: "#7b8799", marginTop: 7, wordBreak: "break-all" }}>{link.detail}</span>
            </div>
            <Arrow />
          </div>)}
          {links.length === 0 ? <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 180, borderRadius: 20, background: "#f3f7ff", color: "#647086", fontSize: 21 }}>새로운 연결을 준비하고 있어요.</div> : null}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #dfe7f3", paddingTop: 18, fontSize: 16, color: "#7b8799" }}>
        <span>나를 담은 링크, mylink</span>
        <div style={{ display: "flex", gap: 10, alignItems: "center", color: blue }}><span>{data ? "프로필 보러 가기" : "나만의 링크 페이지 만들기"}</span><Arrow /></div>
      </div>
    </div>,
    { width: 1200, height: 630, fonts: [{ name: "Pretendard", data: await font, weight: 600, style: "normal" }] },
  );
}
