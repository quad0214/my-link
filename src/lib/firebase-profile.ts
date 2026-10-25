import { collection, doc, getDocs, limit, query, runTransaction, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { AuthUser } from "@/lib/firebase-auth";
import { displaynameSchema, profileFormSchema, type ProfileFormValues } from "@/lib/profile-validation";
import type { Profile } from "@/types/profile";

export function googleProfile(user: AuthUser): Profile {
  const prefix = user.email?.split("@")[0]?.toLowerCase() || "user";
  const parsed = displaynameSchema.safeParse(prefix);
  const displayname = parsed.success ? parsed.data : fallbackDisplayname(user.uid);
  return { id: user.uid, username: user.email?.split("@")[0] || "사용자", displayname,
    bio: "나만의 링크를 추가하고 관리해 보세요.", avatarUrl: user.photoURL, email: user.email };
}
function fallbackDisplayname(uid: string) {
  return "user-" + uid.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 28);
}
function requireOwner(uid: string) {
  if (auth.currentUser?.uid !== uid) throw new Error("로그인이 필요합니다.");
}

export async function isDisplaynameAvailable(uid: string, value: string): Promise<boolean> {
  const displayname = displaynameSchema.parse(value);
  const matches = await getDocs(query(collection(db, "users"), where("displayname", "==", displayname), limit(2)));
  return matches.docs.every((document) => document.id === uid);
}

export async function fetchUserProfile(user: AuthUser): Promise<Profile> {
  requireOwner(user.uid);
  const reference = doc(db, "users", user.uid);
  const fallback = googleProfile(user);
  // Only the user's document is transacted, preserving an existing signup date.
  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(reference);
    const existing = snapshot.exists() ? snapshot.data() : null;
    const oldHandle = displaynameSchema.safeParse(existing?.displayname);
    let displayname = oldHandle.success ? oldHandle.data : fallback.displayname;
    if (!oldHandle.success && !(await isDisplaynameAvailable(user.uid, displayname))) {
      displayname = fallbackDisplayname(user.uid);
      if (!(await isDisplaynameAvailable(user.uid, displayname))) throw new Error("아이디를 등록하지 못했어요. 다시 시도해 주세요.");
    }
    requireOwner(user.uid);
    const profile: Profile = {
      ...fallback,
      username: typeof existing?.username === "string" && existing.username.trim() ? existing.username : typeof existing?.displayName === "string" && existing.displayName.trim() ? existing.displayName : fallback.username,
      displayname,
      bio: typeof existing?.bio === "string" ? existing.bio : fallback.bio,
      avatarUrl: existing && "avatarUrl" in existing ? existing.avatarUrl : fallback.avatarUrl,
      email: existing && "email" in existing ? existing.email : fallback.email,
    };
    const fields = { username: profile.username, displayname, bio: profile.bio, avatarUrl: profile.avatarUrl, email: profile.email };
    if (!existing) transaction.set(reference, { ...fields, createdAt: serverTimestamp() });
    else if (existing.username !== profile.username || existing.displayname !== displayname) transaction.update(reference, fields);
    return profile;
  });
}

export async function updateUserProfile(uid: string, values: ProfileFormValues): Promise<void> {
  requireOwner(uid);
  const data = profileFormSchema.parse(values);
  if (!(await isDisplaynameAvailable(uid, data.displayname))) throw new Error("이미 사용 중인 아이디입니다. 다른 아이디를 입력해 주세요.");
  requireOwner(uid);
  await updateDoc(doc(db, "users", uid), { ...data, updatedAt: serverTimestamp() });
}
