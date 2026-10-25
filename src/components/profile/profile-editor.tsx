"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAccountBusy, useCurrentProfile, useProfileWrite } from "@/hooks/use-account-data";
import { profileUpdateSchema, type ProfileUpdateValues } from "@/lib/profile-validation";
import type { Profile } from "@/types/profile";

type Field = "username" | "bio";
const labels: Record<Field, string> = { username: "이름", bio: "소개글" };

function FieldForm({ profile, field, onClose }: { profile: Profile; field: Field; onClose: () => void }) {
  const profileWrite = useProfileWrite(onClose);
  const { register, handleSubmit, setFocus, formState: { errors } } = useForm<ProfileUpdateValues>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: { username: profile.username, bio: profile.bio },
    reValidateMode: "onChange",
  });
  useEffect(() => { setFocus(field); }, [field, setFocus]);

  function save(values: ProfileUpdateValues) {
    const next = { username: profile.username, displayname: profile.displayname, bio: profile.bio, [field]: values[field] };
    const pending = profileWrite.mutateAsync(next);
    // onMutate closes the editor after changing the cache, before network I/O.
    toast.promise(pending, {
      loading: "프로필 저장 중…",
      success: "프로필을 저장했어요.",
      error: (error: Error) => error.message || "저장하지 못해 이전 정보로 되돌렸어요.",
    });
  }
  const label = labels[field];
  return (
    <form onSubmit={handleSubmit(save)} className="w-full space-y-3 text-left" aria-label={label + " 수정"} onKeyDown={(event) => { if (event.key === "Escape") { event.preventDefault(); onClose(); } }} noValidate>
      <Label htmlFor={"profile-" + field}>{label}</Label>
      {field === "bio" ? (
        <textarea id="profile-bio" rows={3} className="w-full resize-y rounded-[14px] border border-input bg-transparent px-3 py-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/30" aria-invalid={Boolean(errors.bio)} aria-describedby="profile-field-help" {...register("bio")} />
      ) : (
        <Input id={"profile-" + field} className="h-12 rounded-[14px] px-3" autoComplete="off" aria-invalid={Boolean(errors[field])} aria-describedby="profile-field-help" {...register(field)} />
      )}
      <p id="profile-field-help" className={errors[field] ? "text-xs text-destructive" : "text-xs text-muted-foreground"} role={errors[field] ? "alert" : undefined}>{errors[field]?.message || (field === "username" ? "이름은 중복되어도 사용할 수 있어요. (최대 100자)" : "500자까지 입력할 수 있어요.")}</p>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>취소</Button>
        <Button type="submit">확인</Button>
      </div>
    </form>
  );
}

export function ProfileEditor({ profile, field }: { profile: Profile; field: Field }) {
  const [isEditing, setIsEditing] = useState(false);
  const { isPending: isLoading } = useCurrentProfile();
  const isSaving = useAccountBusy("profile");
  const isName = field === "username";
  const trigger = (
    <button type="button" className="inline-flex max-w-full items-center justify-center gap-2 rounded-xl px-2 py-1 text-inherit hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40 disabled:cursor-wait" disabled={isLoading || isSaving} onClick={() => setIsEditing(true)} aria-label={labels[field] + " 수정"}>
      <span className="min-w-0 whitespace-pre-wrap break-words">{isName ? profile.username : profile.bio || "소개글을 입력해 주세요."}</span>
      <Pencil className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
    </button>
  );
  return (
    <div className={isName ? "mt-5 w-full" : "mt-5 w-full max-w-md"}>
      {isName ? <h1 id="profile-name" className={isEditing ? "sr-only" : "text-[28px] font-medium tracking-[-0.02em] text-foreground"}>{isEditing ? profile.username : trigger}</h1> : null}
      {isEditing ? <FieldForm profile={profile} field={field} onClose={() => setIsEditing(false)} /> : !isName ? <p className={field === "bio" ? "text-[16px] leading-7 text-foreground/75" : undefined}>{trigger}</p> : null}
    </div>
  );
}
