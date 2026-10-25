"use client";

import { create } from "zustand";
import { authErrorMessage, loginWithGoogle, logout, type AuthUser } from "@/lib/firebase-auth";
import { deleteLink, fetchLinks, saveLink, updateLink } from "@/lib/firebase-links";
import { fetchUserProfile, googleProfile } from "@/lib/firebase-profile";
import type { ContentBlock, LinkBlock, Profile, ThemePreference } from "@/types/profile";

type LinkInput = Pick<LinkBlock, "title" | "description" | "url">;
type ProfileState = {
  user: AuthUser | null;
  profile: Profile | null;
  sessionId: number;
  isAuthLoading: boolean;
  isAuthBusy: boolean;
  authError: string | null;
  profileError: string | null;
  setUser: (user: AuthUser | null) => Promise<void>;
  failAuth: () => void;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  blocks: ContentBlock[];
  theme: ThemePreference;
  isLoadingLinks: boolean;
  linksError: string | null;
  isMutatingLinks: boolean;
  loadLinks: () => Promise<void>;
  addLink: (link: LinkInput) => Promise<void>;
  editLink: (id: string, link: LinkInput) => Promise<void>;
  removeLink: (id: string) => Promise<void>;
  setTheme: (theme: ThemePreference) => void;
};

export const useProfileStore = create<ProfileState>()((set, get) => {
  let readId = 0;
  function requireSession() {
    const { user, sessionId, isAuthLoading } = get();
    if (!user || isAuthLoading) throw new Error("로그인 후 이용해 주세요.");
    return { uid: user.uid, sessionId };
  }
  function isCurrent(sessionId: number) { return get().sessionId === sessionId; }

  async function mutate(write: (uid: string) => Promise<void>, fallback?: (blocks: ContentBlock[]) => ContentBlock[]) {
    const { uid, sessionId } = requireSession();
    if (get().isMutatingLinks) throw new Error("처리 중인 작업이 있습니다.");
    set({ isMutatingLinks: true });
    try {
      await write(uid);
      if (!isCurrent(sessionId)) return;
      await get().loadLinks();
      if (isCurrent(sessionId) && get().linksError && fallback) {
        set((state) => ({ blocks: fallback(state.blocks) }));
      }
    } finally {
      if (isCurrent(sessionId)) set({ isMutatingLinks: false });
    }
  }

  return {
    user: null, profile: null, sessionId: 0, isAuthLoading: true, isAuthBusy: false,
    authError: null, profileError: null, blocks: [], theme: "system",
    isLoadingLinks: false, linksError: null, isMutatingLinks: false,
    setUser: async (user) => {
      const sessionId = get().sessionId + 1;
      ++readId;
      set({ user, sessionId, profile: user ? googleProfile(user) : null, blocks: [],
        isAuthLoading: false, authError: null, profileError: null, linksError: null,
        isLoadingLinks: Boolean(user), isMutatingLinks: false });
      if (!user) return;
      await Promise.all([
        get().loadLinks(),
        fetchUserProfile(user).then((profile) => {
          if (isCurrent(sessionId)) set({ profile });
        }).catch(() => {
          if (isCurrent(sessionId)) set({ profileError: "프로필을 저장하거나 불러오지 못해 Google 계정 정보를 표시하고 있어요." });
        }),
      ]);
    },
    failAuth: () => {
      void get().setUser(null);
      set({ authError: "로그인 상태를 확인하지 못했어요. 페이지를 새로고침해 주세요." });
    },
    login: async () => {
      if (get().isAuthBusy) return;
      set({ isAuthBusy: true, authError: null });
      try { await loginWithGoogle(); }
      catch (error) { set({ authError: authErrorMessage(error) }); }
      finally { set({ isAuthBusy: false }); }
    },
    logout: async () => {
      if (get().isAuthBusy || get().isMutatingLinks) return;
      set({ isAuthBusy: true, authError: null });
      try { await logout(); }
      catch (error) { set({ authError: authErrorMessage(error) }); }
      finally { set({ isAuthBusy: false }); }
    },
    loadLinks: async () => {
      if (!get().user || get().isAuthLoading) return;
      const { uid, sessionId } = requireSession();
      const requestId = ++readId;
      set({ isLoadingLinks: true, linksError: null });
      try {
        const blocks = await fetchLinks(uid);
        if (isCurrent(sessionId) && requestId === readId) set({ blocks, isLoadingLinks: false, linksError: null });
      } catch {
        if (isCurrent(sessionId) && requestId === readId) set({ isLoadingLinks: false, linksError: "링크를 불러오지 못했어요. 다시 시도해 주세요." });
      }
    },
    addLink: async (link) => {
      const sortOrder = get().blocks.reduce((highest, block) => Math.max(highest, block.sortOrder), -1) + 1;
      await mutate((uid) => saveLink(uid, link, sortOrder));
    },
    editLink: (id, link) => mutate((uid) => updateLink(uid, id, link),
      (blocks) => blocks.map((block) => block.id === id ? { ...block, ...link } : block)),
    removeLink: (id) => mutate((uid) => deleteLink(uid, id), (blocks) => blocks.filter((block) => block.id !== id)),
    setTheme: (theme) => set({ theme }),
  };
});
