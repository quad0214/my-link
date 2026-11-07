"use client";

import type { ComponentProps } from "react";
import { incrementLinkClick } from "@/lib/firebase-links";

type TrackedLinkProps = Omit<ComponentProps<"a">, "onClick" | "onAuxClick"> & {
  uid: string;
  linkId: string;
};

export function TrackedLink({ uid, linkId, children, ...props }: TrackedLinkProps) {
  function recordClick() {
    // Keep normal navigation immediate, even when analytics cannot be saved.
    // Do not refetch the entire list just to refresh the displayed counter.
    void incrementLinkClick(uid, linkId)
      .catch((error: unknown) => console.error("링크 클릭 집계에 실패했습니다.", error));
  }

  return (
    <a {...props} onClick={recordClick} onAuxClick={(event) => {
      if (event.button === 1) recordClick();
    }}>
      {children}
    </a>
  );
}
