"use client";

import { create } from "zustand";

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
  addLink: (link: Pick<LinkBlock, "title" | "description" | "url">) => void;
  setTheme: (theme: ThemePreference) => void;
};

export const useProfileStore = create<ProfileState>()((set) => ({
  profile: mockData.profile,
  blocks: mockData.blocks,
  theme: "system",
  addLink: (link) =>
    set((state) => ({
      blocks: [
        ...state.blocks,
        {
          id: `link_${crypto.randomUUID()}`,
          type: "link",
          icon: "globe",
          visible: true,
          sortOrder:
            state.blocks.reduce((highest, block) => Math.max(highest, block.sortOrder), -1) + 1,
          ...link,
        },
      ],
    })),
  setTheme: (theme) => set({ theme }),
}));
