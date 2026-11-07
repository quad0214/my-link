export const siteTitle = "MyLink — 나의 모든 링크를 한곳에";
export const siteDescription = "프로필과 다양한 채널을 하나의 링크로 공유하는 마이링크입니다.";

export const siteUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000"),
);
