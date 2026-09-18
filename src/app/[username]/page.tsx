import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PublicProfile } from "@/components/profile/public-profile";
import mockResponse from "@/mocks/profile-links.json";

type ProfilePageProps = {
  params: Promise<{ username: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ username: mockResponse.data.profile.username }];
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  if (username !== mockResponse.data.profile.username) return {};

  return {
    title: `${mockResponse.data.profile.displayName} (@${username}) | MyLink`,
    description: mockResponse.data.profile.bio,
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  if (username !== mockResponse.data.profile.username) notFound();

  return <PublicProfile />;
}
