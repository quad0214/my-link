import { StatsPage } from "@/components/profile/stats-page";
import { createPageMetadata } from "@/lib/site-metadata";

export const metadata = createPageMetadata({
  title: "링크 클릭 통계 | MyLink",
  description: "내 공개 링크의 총 클릭 수와 링크별 클릭 통계를 확인하고, 방문자의 관심을 살펴보세요.",
  path: "/stats",
  index: false,
});

export default function StatsRoute() {
  return <StatsPage />;
}
