import Link from "next/link";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { SiteFavicon } from "@/components/profile/site-favicon";
import { TrackedLink } from "@/components/profile/tracked-link";
import { getPublicProfile } from "@/lib/public-profile";
import { profilePath } from "@/lib/profile-validation";
import { createPageMetadata } from "@/lib/site-metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ displayname: string }> }): Promise<Metadata> {
  const { displayname } = await params;
  const data = await getPublicProfile(displayname);
  if (!data) notFound();
  const title = `${data.profile.username} (@${data.profile.displayname}) | MyLink`;
  const description = data.profile.bio.trim() || `${data.profile.username}님의 SNS, 포트폴리오, 블로그 등 공개 링크를 한곳에서 만나보세요.`;
  return createPageMetadata({
    title,
    description,
    path: profilePath(data.profile.displayname),
    type: "profile",
  });
}

export default async function PublicProfilePage({ params }: { params: Promise<{ displayname: string }> }) {
  const { displayname } = await params;
  const data = await getPublicProfile(displayname);
  if (!data) notFound();
  const { profile, links } = data;
  return (
    <>
      <header className="border-b border-border/70">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 font-medium"><span className="flex size-8 items-center justify-center rounded-[12px] bg-primary text-primary-foreground">M</span>mylink</Link>
          <Link href="/" className="rounded-xl px-3 py-2 text-sm hover:bg-muted">내 링크 관리</Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-[520px] px-6 pb-12 pt-14">
        <section className="flex flex-col items-center text-center" aria-labelledby="public-profile-name">
          <div className="flex size-24 items-center justify-center overflow-hidden rounded-[26px] bg-primary/10 text-2xl font-medium text-primary">
            {profile.avatarUrl ? <Image unoptimized width={96} height={96} src={profile.avatarUrl} alt={profile.username + " 프로필 사진"} className="size-full object-cover" referrerPolicy="no-referrer" /> : profile.username.charAt(0)}
          </div>
          <h1 id="public-profile-name" className="mt-5 break-words text-[28px] font-medium">{profile.username}</h1>
          <p className="mt-1 break-all text-sm text-muted-foreground">@{profile.displayname}</p>
          <p className="mt-5 whitespace-pre-wrap break-words text-[16px] leading-7 text-foreground/75">{profile.bio}</p>
        </section>
        <section className="mt-10 space-y-3" aria-label="공개 링크">
          {links.map((link) => (
            <TrackedLink key={link.id} uid={profile.id} linkId={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="flex min-h-[76px] items-center gap-3 rounded-[20px] border border-border/80 bg-card px-3 py-3 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-[14px] bg-primary/10 text-primary"><SiteFavicon url={link.url} /></span>
              <span className="min-w-0 flex-1"><span className="block truncate text-[15px] font-medium">{link.title}</span><span className="mt-1 block truncate text-[13px] text-muted-foreground">{link.description || link.url}</span></span>
              <ExternalLink className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            </TrackedLink>
          ))}
          {links.length === 0 ? <p className="rounded-[20px] bg-muted px-6 py-10 text-center text-sm text-muted-foreground">아직 공개된 링크가 없어요.</p> : null}
        </section>
        <footer className="pt-12 text-center text-sm text-muted-foreground">mylink</footer>
      </main>
    </>
  );
}
