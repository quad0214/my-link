"use client";

import { create } from "zustand";

import { saveLink, subscribeToLinks } from "@/lib/firebase-links";
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
  subscribeLinks: () => () => void;
  addLink: (link: Pick<LinkBlock, "title" | "description" | "url">) => Promise<void>;
  setTheme: (theme: ThemePreference) => void;
};

export const useProfileStore = create<ProfileState>()((set, get) => ({
  profile: mockData.profile,
  blocks: [],
  theme: "system",
  isLoadingLinks: true,
  linksError: null,
  subscribeLinks: () => {
    set({ isLoadingLinks: true, linksError: null });
    return subscribeToLinks(
      (blocks) => set({ blocks, isLoadingLinks: false, linksError: null }),
      () => set({ isLoadingLinks: false, linksError: "링크를 불러오지 못했어요. 다시 시도해 주세요." }),
    );
  },
  addLink: async (link) => {
    const sortOrder = get().blocks.reduce(
      (highest, block) => Math.max(highest, block.sortOrder),
      -1,
    ) + 1;
    await saveLink(link, sortOrder);
  },
  setTheme: (theme) => set({ theme }),
}));
