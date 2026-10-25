import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc, orderBy, query, serverTimestamp } from "firebase/firestore";
import { z } from "zod";

import { auth, db } from "@/lib/firebase";
import { linkFormSchema, type LinkFormValues } from "@/lib/link-validation";
import type { LinkBlock } from "@/types/profile";

function userLinks(uid: string) {
  if (!uid || uid.includes("/") || auth.currentUser?.uid !== uid) {
    throw new Error("로그인이 필요합니다.");
  }
  return collection(db, "users", uid, "links");
}

export const linkSchema = z.object({
  type: z.literal("link"),
  title: z.string().trim().min(1).max(50),
  description: z.string().max(100),
  url: z.url().refine((value) => /^https?:\/\//i.test(value)),
  icon: z.enum(["instagram", "youtube", "globe", "github"]),
  visible: z.boolean(),
  sortOrder: z.number().finite(),
});

export async function fetchLinks(uid: string): Promise<LinkBlock[]> {
  const snapshot = await getDocs(query(userLinks(uid), orderBy("createdAt", "desc")));
  const links: LinkBlock[] = [];

  for (const document of snapshot.docs) {
    const result = linkSchema.safeParse(document.data());
    if (result.success) links.push({ ...result.data, id: document.id });
  }

  return links;
}

export async function saveLink(
  uid: string,
  link: Pick<LinkBlock, "title" | "description" | "url">,
  sortOrder: number,
): Promise<void> {
  const data = linkSchema.parse({
    ...link,
    type: "link",
    icon: "globe",
    visible: true,
    sortOrder,
  });

  await addDoc(userLinks(uid), { ...data, createdAt: serverTimestamp() });
}

export async function updateLink(uid: string, id: string, values: LinkFormValues): Promise<void> {
  const data = linkFormSchema.parse(values);
  await updateDoc(doc(userLinks(uid), id), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteLink(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(userLinks(uid), id));
}
