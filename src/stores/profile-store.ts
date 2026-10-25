"use client";

import { create } from "zustand";

import { deleteLink, fetchLinks, saveLink, updateLink } from "@/lib/firebase-links";
import mockResponse from "@/mocks/profile-links.json";
import type {
  ContentBlock,
  LinkBlock,
  Profile,
  ProfileLinksResponse,
  ThemePreference,
} from "@/types/profile";

const mockData = (mockResponse as ProfileLinksResponse).data;

type ProfileState = {
  profile: Profile;
  blocks: ContentBlock[];
  theme: ThemePreference;
  isLoadingLinks: boolean;
  linksError: string | null;
  isMutatingLinks: boolean;
  editLink: (id: string, link: Pick<LinkBlock, "title" | "description" | "url">) => Promise<void>;
  removeLink: (id: string) => Promise<void>;
  loadLinks: () => Promise<void>;
  addLink: (link: Pick<LinkBlock, "title" | "description" | "url">) => Promise<void>;
  setTheme: (theme: ThemePreference) => void;
};

export const useProfileStore = create<ProfileState>()((set, get) => ({
  profile: mockData.profile,
  blocks: [],
  theme: "system",
  isLoadingLinks: true,
  linksError: null,
  isMutatingLinks: false,
  loadLinks: async () => {
    set({ isLoadingLinks: true, linksError: null });
    try {
      const blocks = await fetchLinks();
      set({ blocks, isLoadingLinks: false, linksError: null });
    } catch {
      set({ isLoadingLinks: false, linksError: "링크를 불러오지 못했어요. 다시 시도해 주세요." });
    }
  },
  addLink: async (link) => {
    const sortOrder = get().blocks.reduce(
      (highest, block) => Math.max(highest, block.sortOrder),
      -1,
    ) + 1;
    set({ isMutatingLinks: true });
    try {
      await saveLink(link, sortOrder);
      await get().loadLinks();
    } finally {
      set({ isMutatingLinks: false });
    }
  },
  editLink: async (id, link) => {
    set({ isMutatingLinks: true });
    try {
      await updateLink(id, link);
      await get().loadLinks();
      if (get().linksError) {
        set((state) => ({ blocks: state.blocks.map((block) => block.id === id ? { ...block, ...link } : block) }));
      }
    } finally {
      set({ isMutatingLinks: false });
    }
  },
  removeLink: async (id) => {
    set({ isMutatingLinks: true });
    try {
      await deleteLink(id);
      await get().loadLinks();
      if (get().linksError) {
        set((state) => ({ blocks: state.blocks.filter((block) => block.id !== id) }));
      }
    } finally {
      set({ isMutatingLinks: false });
    }
  },
  setTheme: (theme) => set({ theme }),
}));
