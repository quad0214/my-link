import { MyPage } from "@/components/profile/my-page";
import { createPageMetadata } from "@/lib/site-metadata";

export const metadata = createPageMetadata({
  title: "MyLink — 나만의 링크 페이지를 30분 만에",
  description: "프로필을 채우고 SNS, 포트폴리오, 블로그를 모아보세요. 코딩 없이 30분 만에 나만의 링크 페이지를 만들고 공유하세요.",
  path: "/",
});

export default function Home() {
  return <MyPage />;
}
