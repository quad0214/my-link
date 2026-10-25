import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc, orderBy, query, serverTimestamp } from "firebase/firestore";
import { z } from "zod";

import { db } from "@/lib/firebase";
import { linkFormSchema, type LinkFormValues } from "@/lib/link-validation";
import type { LinkBlock } from "@/types/profile";

const linksCollection = collection(db, "users", "anonymous", "links");
const latestLinksQuery = query(linksCollection, orderBy("createdAt", "desc"));

const linkSchema = z.object({
  type: z.literal("link"),
  title: z.string().trim().min(1).max(50),
  description: z.string().max(100),
  url: z.url().refine((value) => /^https?:\/\//i.test(value)),
  icon: z.enum(["instagram", "youtube", "globe", "github"]),
  visible: z.boolean(),
  sortOrder: z.number().finite(),
});

export async function fetchLinks(): Promise<LinkBlock[]> {
  const snapshot = await getDocs(latestLinksQuery);
  const links: LinkBlock[] = [];

  for (const document of snapshot.docs) {
    const result = linkSchema.safeParse(document.data());
    if (result.success) links.push({ ...result.data, id: document.id });
  }

  return links;
}

export async function saveLink(
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

  await addDoc(linksCollection, { ...data, createdAt: serverTimestamp() });
}

export async function updateLink(id: string, values: LinkFormValues): Promise<void> {
  const data = linkFormSchema.parse(values);
  await updateDoc(doc(linksCollection, id), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteLink(id: string): Promise<void> {
  await deleteDoc(doc(linksCollection, id));
}
