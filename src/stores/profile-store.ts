"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import mockResponse from "@/mocks/profile-links.json";
import type {
  ContentBlock,
  Profile,
  ProfileLinksResponse,
  ThemePreference,
} from "@/types/profile";

export const PROFILE_STORAGE_KEY = "mylink:profile:jongcheon:v1";

const mockData = (mockResponse as ProfileLinksResponse).data;

type ProfileState = {
  version: 1;
  profile: Profile;
  blocks: ContentBlock[];
  theme: ThemePreference;
  updatedAt: string;
  hasHydrated: boolean;
  setTheme: (theme: ThemePreference) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
};

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      version: 1,
      profile: mockData.profile,
      blocks: mockData.blocks,
      theme: "system",
      updatedAt: mockData.updatedAt,
      hasHydrated: false,
      setTheme: (theme) => set({ theme }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: PROFILE_STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: ({ version, profile, blocks, theme, updatedAt }) => ({
        version,
        profile,
        blocks,
        theme,
        updatedAt,
      }),
    },
  ),
);
