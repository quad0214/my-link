import { collection, getDocs, limit, query, where, Timestamp } from "firebase/firestore";
import { z } from "zod";
import { db } from "@/lib/firebase";
import { linkSchema } from "@/lib/firebase-links";
import { displaynameSchema } from "@/lib/profile-validation";
import type { LinkBlock, Profile } from "@/types/profile";

const publicSchema = z.object({
  username: z.string().min(1).max(100), displayname: displaynameSchema,
  bio: z.string().max(500), avatarUrl: z.url().refine((value) => /^https?:\/\//i.test(value)).nullable().catch(null),
});

export async function fetchPublicProfile(handle: string): Promise<{ profile: Profile; links: LinkBlock[] } | null> {
  const parsed = displaynameSchema.safeParse(handle);
  if (!parsed.success) return null;
  const matches = await getDocs(query(collection(db, "users"), where("displayname", "==", parsed.data), limit(2)));
  // A duplicate identifier is ambiguous: never show an arbitrary user's page.
  if (matches.docs.length !== 1) return null;
  const document = matches.docs[0];
  const uid = document.id;
  const result = publicSchema.safeParse(document.data());
  if (!result.success || result.data.displayname !== parsed.data) return null;
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
