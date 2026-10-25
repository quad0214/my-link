"use client";

import { useState, type ComponentType } from "react";
import { Camera, Code2, ExternalLink, Globe2, Link as LinkIcon, LoaderCircle, Pencil, Play, Trash2, type LucideProps } from "lucide-react";

import { LinkForm } from "@/components/profile/link-form";
import { Button, buttonVariants } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { LinkFormValues } from "@/lib/link-validation";
import { useProfileStore } from "@/stores/profile-store";
import type { LinkBlock, LinkIcon as LinkIconName } from "@/types/profile";

const linkIcons: Record<LinkIconName, ComponentType<LucideProps>> = {
  instagram: Camera,
  youtube: Play,
  globe: Globe2,
  github: Code2,
};

function LinkPreview({ block }: { block: LinkBlock }) {
  const Icon = linkIcons[block.icon] ?? LinkIcon;

  return (
    <a
      href={block.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${block.title}: ${block.description}`}
      className={cn(
        buttonVariants({ variant: "outline", size: "lg" }),
        "group h-auto min-h-[76px] w-full justify-start gap-3 rounded-[20px] border-0 bg-card px-3 py-3 text-left shadow-none",
        "hover:-translate-y-0.5 hover:border-primary/35 hover:bg-card hover:shadow-[0_10px_30px_-18px_var(--primary)]",
        "focus-visible:ring-3 focus-visible:ring-ring/40 active:translate-y-0",
      )}
    >
      <span className="flex size-12 shrink-0 items-center justify-center rounded-[14px] bg-primary/10 text-primary">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-medium text-foreground">{block.title}</span>
        <span className="mt-1 block truncate text-[13px] font-normal text-muted-foreground">
          {block.description || block.url}
        </span>
      </span>
      <ExternalLink
        className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        aria-hidden="true"
      />
    </a>
  );
}

export function LinkCard({ block, onSuccess }: { block: LinkBlock; onSuccess: (message: string) => void }) {
  const editLink = useProfileStore((state) => state.editLink);
  const removeLink = useProfileStore((state) => state.removeLink);
  const isLoadingLinks = useProfileStore((state) => state.isLoadingLinks);
  const isMutatingLinks = useProfileStore((state) => state.isMutatingLinks);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const actionsDisabled = isMutatingLinks || isLoadingLinks;

  async function save(values: LinkFormValues) {
    await editLink(block.id, values);
    setIsEditing(false);
    onSuccess(values.title + " 링크를 수정했어요.");
  }

  function changeDeleteOpen(open: boolean) {
    if (isDeleting) return;
    setDeleteOpen(open);
    setDeleteError(null);
  }

  async function confirmDelete() {
    if (isDeleting) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await removeLink(block.id);
      setDeleteOpen(false);
      onSuccess(block.title + " 링크를 삭제했어요.");
    } catch {
      setDeleteError("링크를 삭제하지 못했어요. 연결을 확인하고 다시 시도해 주세요.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <article className="min-w-0 rounded-[20px] border border-border/80 bg-card" aria-label={block.title + " 링크 관리"}>
      {isEditing ? (
        <div className="space-y-4 p-4">
          <h3 className="text-sm font-medium">링크 수정</h3>
          <LinkForm initialValues={{ title: block.title, url: block.url, description: block.description }} onSave={save} submitLabel="변경하기" onCancel={() => setIsEditing(false)} disabled={actionsDisabled} focusOnMount />
        </div>
      ) : <LinkPreview block={block} />}
      <div className="flex items-center justify-end gap-2 border-t border-border/60 px-3 py-2">
        <Button type="button" variant="ghost" className="h-9 rounded-[12px] px-3" aria-label={block.title + " 링크 수정"} disabled={actionsDisabled || isEditing} onClick={() => setIsEditing(true)}>
          <Pencil aria-hidden="true" />수정
        </Button>
        <Dialog open={deleteOpen} onOpenChange={changeDeleteOpen}>
          <DialogTrigger render={<Button type="button" variant="destructive" className="h-9 rounded-[12px] px-3" aria-label={block.title + " 링크 삭제"} disabled={actionsDisabled || isEditing} />}>
            <Trash2 aria-hidden="true" />삭제
          </DialogTrigger>
          <DialogContent className="gap-5 rounded-[24px] p-5 sm:max-w-md" showCloseButton={!isDeleting}>
            <DialogHeader className="pr-6">
              <DialogTitle className="text-xl">정말 삭제하시겠습니까</DialogTitle>
              <DialogDescription className="break-all">{block.title}</DialogDescription>
            </DialogHeader>
            <p className="text-sm font-medium text-destructive">이 작업은 되돌릴 수 없습니다</p>
            {deleteError ? <p className="text-sm text-destructive" role="alert">{deleteError}</p> : null}
            <DialogFooter className="mx-0 mb-0 flex-row justify-end rounded-[18px] border-0 bg-muted/60 p-3">
              <Button type="button" variant="outline" className="h-10 rounded-[14px] px-5" disabled={isDeleting} onClick={() => changeDeleteOpen(false)}>취소</Button>
              <Button type="button" variant="destructive" className="relative h-10 rounded-[14px] px-5" disabled={isDeleting} aria-busy={isDeleting} aria-label={isDeleting ? "삭제 처리 중" : "삭제하기"} onClick={() => void confirmDelete()}>
                {isDeleting ? <LoaderCircle className="absolute size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" /> : null}
                <span className={isDeleting ? "invisible" : undefined}>삭제하기</span>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </article>
  );
}
