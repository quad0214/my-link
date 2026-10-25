"use client";
import { useIsMutating, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { accountKey, linksOptions, linkWriteOptions, profileOptions, profileWriteOptions } from "@/lib/account-queries";
import { googleProfile } from "@/lib/firebase-profile";
import { useProfileStore } from "@/stores/profile-store";

function useSession() {
  const user = useProfileStore((state) => state.user);
  const sessionId = useProfileStore((state) => state.sessionId);
  const isAuthLoading = useProfileStore((state) => state.isAuthLoading);
  const session = { user: user || { uid: "", displayName: null, email: null, photoURL: null }, sessionId };
  const enabled = Boolean(user) && !isAuthLoading;
  const isCurrent = () => enabled && useProfileStore.getState().sessionId === sessionId && useProfileStore.getState().user?.uid === user?.uid;
  return { session, enabled, isCurrent };
}
export function useCurrentProfile() {
  const { session, enabled } = useSession();
  const query = useQuery({ ...profileOptions(session), enabled });
  return { ...query, profile: enabled ? query.data || googleProfile(session.user) : null };
}
export function useLinks() {
  const { session, enabled } = useSession();
  return useQuery({ ...linksOptions(session), enabled });
}
export function useAccountBusy(kind?: "links" | "profile") {
  const { session } = useSession();
  return useIsMutating({ mutationKey: [...accountKey(session), "write", ...(kind ? [kind] : [])] }) > 0;
}
export function useLinkWrite() {
  const { session, isCurrent } = useSession();
  const client = useQueryClient();
  return useMutation(linkWriteOptions(client, session, isCurrent, () => toast.error("저장은 완료했지만 목록 갱신에 실패했어요. 새로고침해 주세요.")));
}
export function useProfileWrite(onOptimistic?: () => void) {
  const { session, isCurrent } = useSession();
  return useMutation(profileWriteOptions(useQueryClient(), session, isCurrent, onOptimistic));
}
