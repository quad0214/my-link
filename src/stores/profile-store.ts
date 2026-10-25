"use client";
import { create } from "zustand";
import { authErrorMessage, loginWithGoogle, logout, type AuthUser } from "@/lib/firebase-auth";
import { getQueryClient } from "@/lib/query-client";
import type { ThemePreference } from "@/types/profile";

type AuthState = {
  user: AuthUser | null; sessionId: number; isAuthLoading: boolean; isAuthBusy: boolean;
  authError: string | null; theme: ThemePreference;
  setUser: (user: AuthUser | null) => void;
  failAuth: () => void; login: () => Promise<void>; logout: () => Promise<void>;
  setTheme: (theme: ThemePreference) => void;
};
export const useProfileStore = create<AuthState>()((set, get) => ({
  user: null, sessionId: 0, isAuthLoading: true, isAuthBusy: false, authError: null, theme: "system",
  setUser: (user) => {
    const client = getQueryClient();
    void client.cancelQueries({ queryKey: ["account"] });
    client.removeQueries({ queryKey: ["account"] });
    set({ user, sessionId: get().sessionId + 1, isAuthLoading: false, authError: null });
  },
  failAuth: () => {
    get().setUser(null);
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
    if (get().isAuthBusy || getQueryClient().isMutating()) return;
    set({ isAuthBusy: true, authError: null });
    try { await logout(); }
    catch (error) { set({ authError: authErrorMessage(error) }); }
    finally { set({ isAuthBusy: false }); }
  },
  setTheme: (theme) => set({ theme }),
}));
