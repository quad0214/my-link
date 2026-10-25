import { doc, runTransaction, serverTimestamp } from "firebase/firestore";
import { z } from "zod";
import { auth, db } from "@/lib/firebase";
import type { AuthUser } from "@/lib/firebase-auth";
import type { Profile } from "@/types/profile";

export function googleProfile(user: AuthUser): Profile {
  return {
    id: user.uid,
    displayName: user.email?.split("@")[0]?.trim() || "사용자",
    username: "",
    bio: "나만의 링크를 추가하고 관리해 보세요.",
    avatarUrl: user.photoURL,
    email: user.email,
  };
}

const profileSchema = z.object({
  displayName: z.string().trim().min(1).max(100).optional(),
  email: z.email().nullable().optional(),
  username: z.string().trim().max(100).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.url().refine((value) => /^https?:\/\//i.test(value)).nullable().optional(),
});

export async function fetchUserProfile(user: AuthUser): Promise<Profile> {
  if (auth.currentUser?.uid !== user.uid) throw new Error("로그인이 필요합니다.");
  const reference = doc(db, "users", user.uid);
  const fallback = googleProfile(user);
  const data = await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(reference);
    if (auth.currentUser?.uid !== user.uid) throw new Error("로그인이 필요합니다.");
    // A transaction also protects existing data when two tabs log in together.
    if (snapshot.exists()) return snapshot.data();
    const initialProfile = {
      displayName: fallback.displayName,
      email: user.email,
      avatarUrl: user.photoURL,
      createdAt: serverTimestamp(),
    };
    transaction.set(reference, initialProfile);
    return initialProfile;
  });
  const result = profileSchema.safeParse(data);
  return result.success ? { ...fallback, ...result.data, id: user.uid } : fallback;
}
