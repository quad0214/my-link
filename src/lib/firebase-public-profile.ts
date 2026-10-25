import { collection, doc, getDoc, getDocs, query, where, Timestamp } from "firebase/firestore";
import { z } from "zod";
import { db } from "@/lib/firebase";
import { linkSchema } from "@/lib/firebase-links";
import { displaynameSchema } from "@/lib/profile-validation";
import type { LinkBlock, Profile } from "@/types/profile";

const publicSchema = z.object({
  uid: z.string().min(1), username: z.string().min(1).max(100), displayname: displaynameSchema,
  bio: z.string().max(500), avatarUrl: z.url().refine((value) => /^https?:\/\//i.test(value)).nullable().catch(null),
});

export async function fetchPublicProfile(handle: string): Promise<{ profile: Profile; links: LinkBlock[] } | null> {
  const parsed = displaynameSchema.safeParse(handle);
  if (!parsed.success) return null;
  const lookup = await getDoc(doc(db, "handles", parsed.data));
  if (!lookup.exists() || typeof lookup.data().uid !== "string") return null;
  const uid = lookup.data().uid as string;
  if (uid.includes("/")) return null;
  const snapshot = await getDoc(doc(db, "publicProfiles", uid));
  if (!snapshot.exists()) return null;
  const result = publicSchema.safeParse(snapshot.data());
  if (!result.success || result.data.uid !== uid || result.data.displayname !== parsed.data) return null;
  const response = await getDocs(query(collection(db, "users", uid, "links"), where("visible", "==", true)));
  const links: { block: LinkBlock; createdAt: number }[] = [];
  for (const document of response.docs) {
    const data = document.data();
    const link = linkSchema.safeParse(data);
    if (link.success && link.data.visible) links.push({ block: { ...link.data, id: document.id }, createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : 0 });
  }
  links.sort((a, b) => b.createdAt - a.createdAt || a.block.id.localeCompare(b.block.id));
  const { username, displayname, bio, avatarUrl } = result.data;
  return { profile: { id: uid, username, displayname, bio, avatarUrl }, links: links.map((item) => item.block) };
}
