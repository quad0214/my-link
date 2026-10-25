import { addDoc, collection, onSnapshot, serverTimestamp } from "firebase/firestore";
import { z } from "zod";

import { db } from "@/lib/firebase";
import type { LinkBlock } from "@/types/profile";

const linksCollection = collection(db, "users", "anonymous", "links");

const linkSchema = z.object({
  type: z.literal("link"),
  title: z.string().trim().min(1).max(50),
  description: z.string().max(100),
  url: z.url().refine((value) => /^https?:\/\//i.test(value)),
  icon: z.enum(["instagram", "youtube", "globe", "github"]),
  visible: z.boolean(),
  sortOrder: z.number().finite(),
});

export function subscribeToLinks(
  onLinks: (links: LinkBlock[]) => void,
  onError: (error: Error) => void,
) {
  return onSnapshot(
    linksCollection,
    { includeMetadataChanges: true },
    (snapshot) => {
      const links: LinkBlock[] = [];

      for (const document of snapshot.docs) {
        // Display new links only after the server confirms the write.
        if (document.metadata.hasPendingWrites) continue;

        const result = linkSchema.safeParse(document.data());
        if (result.success) links.push({ ...result.data, id: document.id });
      }

      onLinks(links.sort((a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id)));
    },
    onError,
  );
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
