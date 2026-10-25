import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";

export type AuthUser = Pick<User, "uid" | "displayName" | "email" | "photoURL">;

export function observeAuth(onUser: (user: AuthUser | null) => void, onError: (error: Error) => void) {
  return onAuthStateChanged(auth, onUser, onError);
}

export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  await signInWithPopup(auth, provider);
}

export async function logout() {
  await signOut(auth);
}

export function authErrorMessage(error: unknown): string | null {
  const code = error && typeof error === "object" && "code" in error ? error.code : "";
  if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") return null;
  if (code === "auth/popup-blocked") return "팝업이 차단되었어요. 팝업을 허용한 뒤 다시 로그인해 주세요.";
  if (code === "auth/unauthorized-domain") return "이 도메인에서 로그인할 수 없어요. Firebase의 승인된 도메인 설정을 확인해 주세요.";
  if (code === "auth/operation-not-allowed" || code === "auth/configuration-not-found") return "Google 로그인이 아직 활성화되지 않았어요. Firebase Authentication 설정을 확인해 주세요.";
  return "로그인 상태를 변경하지 못했어요. 연결을 확인하고 다시 시도해 주세요.";
}
