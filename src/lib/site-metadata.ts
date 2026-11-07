import type { Metadata } from "next";

export const siteTitle = "MyLink — 나의 모든 링크를 한곳에";
export const siteDescription = "프로필과 다양한 채널을 하나의 링크로 공유하는 마이링크입니다.";

export const siteUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000"),
);

type PageMetadataOptions = {
  title: string;
  description: string;
  path: string;
  index?: boolean;
  type?: "website" | "profile";
};

export function createPageMetadata({
  title,
  description,
  path,
  index = true,
  type = "website",
}: PageMetadataOptions): Metadata {
  const url = new URL(path, siteUrl).toString();

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: { index, follow: index },
    openGraph: {
      title,
      description,
      url,
      siteName: "MyLink",
      locale: "ko_KR",
      type,
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: siteTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [{ url: "/twitter-image", alt: siteTitle }],
    },
  };
}
