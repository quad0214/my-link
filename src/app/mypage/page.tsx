import type { Metadata } from "next";

import { MyPage } from "@/components/profile/my-page";
import mockResponse from "@/mocks/profile-links.json";

export const metadata: Metadata = {
  title: `내 링크 관리 | MyLink`,
  description: `${mockResponse.data.profile.displayName}님의 링크를 추가하고 확인하는 마이페이지입니다.`,
};

export default function MyPageRoute() {
  return <MyPage />;
}
