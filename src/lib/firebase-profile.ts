import { doc, runTransaction, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { AuthUser } from "@/lib/firebase-auth";
import { displaynameSchema, profileFormSchema, type ProfileFormValues } from "@/lib/profile-validation";
import type { Profile } from "@/types/profile";

export function googleProfile(user: AuthUser): Profile {
  const prefix = user.email?.split("@")[0]?.toLowerCase() || "user";
  const parsed = displaynameSchema.safeParse(prefix);
  const displayname = parsed.success ? parsed.data : "user-" + user.uid.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 28);
  return { id: user.uid, username: user.email?.split("@")[0] || "사용자", displayname,
    bio: "나만의 링크를 추가하고 관리해 보세요.", avatarUrl: user.photoURL, email: user.email };
}

export function publicProfile(profile: Profile) {
  return { uid: profile.id, username: profile.username, displayname: profile.displayname, bio: profile.bio, avatarUrl: profile.avatarUrl };
}

export async function fetchUserProfile(user: AuthUser): Promise<Profile> {
  if (auth.currentUser?.uid !== user.uid) throw new Error("로그인이 필요합니다.");
  const reference = doc(db, "users", user.uid);
  const fallback = googleProfile(user);
  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(reference);
    const existing = snapshot.exists() ? snapshot.data() : null;
    const oldHandle = displaynameSchema.safeParse(existing?.displayname);
    let displayname = oldHandle.success ? oldHandle.data : fallback.displayname;
    let handleRef = doc(db, "handles", displayname);
    let handleSnapshot = await transaction.get(handleRef);
    if (handleSnapshot.exists() && handleSnapshot.data().uid !== user.uid) {
      displayname = "user-" + user.uid.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 28);
      handleRef = doc(db, "handles", displayname);
      handleSnapshot = await transaction.get(handleRef);
      if (handleSnapshot.exists() && handleSnapshot.data().uid !== user.uid) throw new Error("아이디를 등록하지 못했어요. 다시 시도해 주세요.");
    }
    if (auth.currentUser?.uid !== user.uid) throw new Error("로그인이 필요합니다.");
    const profile: Profile = {
      ...fallback,
      username: typeof existing?.username === "string" && existing.username.trim() ? existing.username : typeof existing?.displayName === "string" && existing.displayName.trim() ? existing.displayName : fallback.username,
      displayname,
      bio: typeof existing?.bio === "string" ? existing.bio : fallback.bio,
      avatarUrl: existing && "avatarUrl" in existing ? existing.avatarUrl : fallback.avatarUrl,
      email: existing && "email" in existing ? existing.email : fallback.email,
    };
    if (!handleSnapshot.exists()) transaction.set(handleRef, { uid: user.uid });
    const canonical = { username: profile.username, displayname, bio: profile.bio, avatarUrl: profile.avatarUrl, email: profile.email };
    if (!existing) transaction.set(reference, { ...canonical, createdAt: serverTimestamp() });
    else if (existing.username !== profile.username || existing.displayname !== displayname) transaction.update(reference, canonical);
    transaction.set(doc(db, "publicProfiles", user.uid), publicProfile(profile));
    return profile;
  });
}

export async function updateUserProfile(uid: string, values: ProfileFormValues): Promise<void> {
  if (auth.currentUser?.uid !== uid) throw new Error("로그인이 필요합니다.");
  const data = profileFormSchema.parse(values);
  const userRef = doc(db, "users", uid);
  const handleRef = doc(db, "handles", data.displayname);
  await runTransaction(db, async (transaction) => {
    const userSnapshot = await transaction.get(userRef);
    const handleSnapshot = await transaction.get(handleRef);
    if (!userSnapshot.exists()) throw new Error("프로필을 다시 불러와 주세요.");
    if (auth.currentUser?.uid !== uid) throw new Error("로그인이 필요합니다.");
    if (handleSnapshot.exists() && handleSnapshot.data().uid !== uid) throw new Error("이미 사용 중인 아이디입니다. 다른 아이디를 입력해 주세요.");
    const previous = userSnapshot.data();
    const oldHandle = typeof previous.displayname === "string" && previous.displayname !== data.displayname ? previous.displayname : null;
    const oldRef = oldHandle ? doc(db, "handles", oldHandle) : null;
    const oldSnapshot = oldRef ? await transaction.get(oldRef) : null;
    if (!handleSnapshot.exists()) transaction.set(handleRef, { uid });
    transaction.update(userRef, { ...data, updatedAt: serverTimestamp() });
    transaction.set(doc(db, "publicProfiles", uid), { uid, ...data, avatarUrl: previous.avatarUrl ?? null });
    if (oldRef && oldSnapshot?.exists() && oldSnapshot.data().uid === uid) transaction.delete(oldRef);
  });
}
