import { notFound } from "next/navigation";
import { createOgImage } from "@/lib/og-image";
import { getPublicProfile } from "@/lib/public-profile";

export const alt = "MyLink 사용자 프로필과 공개 링크";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-dynamic";

export default async function Image({ params }: { params: Promise<{ displayname: string }> }) {
  const { displayname } = await params;
  const data = await getPublicProfile(displayname);
  if (!data) notFound();
  return createOgImage(data);
}
