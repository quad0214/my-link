import { queryOptions, type QueryClient } from "@tanstack/react-query";
import type { AuthUser } from "@/lib/firebase-auth";
import { fetchLinks, saveLink, updateLink, deleteLink } from "@/lib/firebase-links";
import { fetchUserProfile, updateUserProfile } from "@/lib/firebase-profile";
import { profileUpdateSchema, type ProfileUpdateValues } from "@/lib/profile-validation";
import type { LinkBlock, Profile } from "@/types/profile";

export type AccountSession = { user: AuthUser; sessionId: number };
export const accountKey = (session: AccountSession) => ["account", session.user.uid, session.sessionId, "profile-v4"] as const;
export const profileKey = (session: AccountSession) => [...accountKey(session), "profile"] as const;
export const linksKey = (session: AccountSession) => [...accountKey(session), "links"] as const;
export function profileOptions(session: AccountSession) {
  return queryOptions({ queryKey: profileKey(session), queryFn: async ({ signal }) => {
    const profile = await fetchUserProfile(session.user); signal.throwIfAborted(); return profile;
  } });
}
export function linksOptions(session: AccountSession) {
  return queryOptions({ queryKey: linksKey(session), queryFn: async ({ signal }) => {
    const links = await fetchLinks(session.user.uid); signal.throwIfAborted(); return links;
  } });
}
export type LinkWrite = { type: "add"; values: Pick<LinkBlock, "title" | "url" | "description"> }
  | { type: "edit"; id: string; values: Pick<LinkBlock, "title" | "url" | "description"> }
  | { type: "delete"; id: string };

export function linkWriteOptions(client: QueryClient, session: AccountSession, isCurrent: () => boolean, onRefreshError: () => void) {
  const key = linksKey(session);
  return {
    mutationKey: [...accountKey(session), "write", "links"],
    mutationFn: async (operation: LinkWrite) => {
      if (!isCurrent()) throw new Error("로그인 후 이용해 주세요.");
      const uid = session.user.uid;
      if (operation.type === "delete") await deleteLink(uid, operation.id);
      else if (operation.type === "edit") await updateLink(uid, operation.id, operation.values);
      else {
        const blocks = client.getQueryData<LinkBlock[]>(key) || [];
        const sortOrder = blocks.reduce((max, block) => Math.max(max, block.sortOrder), -1) + 1;
        await saveLink(uid, operation.values, sortOrder);
      }
    },
    onSuccess: async (_: void, operation: LinkWrite) => {
      if (!isCurrent()) return;
      try { await client.invalidateQueries({ queryKey: key, exact: true }, { throwOnError: true }); }
      catch {
        if (!isCurrent()) return;
        // The write succeeded. Do not retry it just because reloading failed.
        if (operation.type !== "add") client.setQueryData<LinkBlock[]>(key, (old = []) => operation.type === "delete"
          ? old.filter((block) => block.id !== operation.id)
          : old.map((block) => block.id === operation.id ? { ...block, ...operation.values } : block));
        onRefreshError();
      }
    },
  };
}

export function profileWriteOptions(client: QueryClient, session: AccountSession, isCurrent: () => boolean, onOptimistic?: () => void) {
  const key = profileKey(session);
  return {
    mutationKey: [...accountKey(session), "write", "profile"],
    mutationFn: async (values: ProfileUpdateValues) => {
      if (!isCurrent()) throw new Error("로그인 후 이용해 주세요.");
      await updateUserProfile(session.user.uid, profileUpdateSchema.parse(values));
    },
    onMutate: (values: ProfileUpdateValues) => {
      if (!isCurrent()) throw new Error("로그인 후 이용해 주세요.");
      const data = profileUpdateSchema.parse(values);
      void client.cancelQueries({ queryKey: key, exact: true });
      const previous = client.getQueryData<Profile>(key);
      if (isCurrent()) client.setQueryData<Profile>(key, (old) => old ? { ...old, ...data } : old);
      onOptimistic?.();
      return { previous };
    },
    onError: (_: Error, __: ProfileUpdateValues, context: { previous: Profile | undefined } | undefined) => {
      if (isCurrent() && context?.previous) client.setQueryData(key, context.previous);
    },
    onSettled: async () => {
      if (isCurrent()) {
        await client.invalidateQueries({ queryKey: key, exact: true });
        await client.invalidateQueries({ queryKey: ["public-profile"] });
      }
    },
  };
}
