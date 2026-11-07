import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "페이지를 찾을 수 없습니다 | MyLink",
  description: "요청한 프로필 페이지를 찾을 수 없습니다. 공개 프로필 주소를 확인해 주세요.",
  robots: { index: false, follow: false },
};

export default function ProfilePreview() {
  notFound();
}
