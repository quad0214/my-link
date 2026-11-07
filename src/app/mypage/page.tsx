import { redirect } from "next/navigation";
import { createPageMetadata } from "@/lib/site-metadata";

export const metadata = createPageMetadata({
  title: "내 링크 관리 | MyLink",
  description: "프로필과 공개 링크를 관리하고 나만의 링크 페이지를 공유하세요.",
  path: "/",
  index: false,
});

export default function MyPageRoute() {
  redirect("/");
}
