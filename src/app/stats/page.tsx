import type { Metadata } from "next";
import { StatsPage } from "@/components/profile/stats-page";

export const metadata: Metadata = { title: "통계 | MyLink" };

export default function StatsRoute() {
  return <StatsPage />;
}
