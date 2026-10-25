import type { Metadata } from "next";

import { MyPage } from "@/components/profile/my-page";

export const metadata: Metadata = {
  title: `내 링크 관리 | MyLink`,
  description: "로그인하고 내 링크를 추가하고 관리하는 마이페이지입니다.",
};

export default function Home() {
  return <MyPage />;
}
