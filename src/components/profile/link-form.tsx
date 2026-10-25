"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { useEffect, useId } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { linkFormSchema, type LinkFormValues } from "@/lib/link-validation";

const emptyValues: LinkFormValues = { title: "", url: "", description: "" };
const fields = [
  { name: "title", label: "제목", placeholder: "예: 블로그" },
  { name: "url", label: "URL", placeholder: "https://example.com" },
  { name: "description", label: "설명 (선택)", placeholder: "링크를 짧게 소개해 주세요." },
] as const;

type LinkFormProps = {
  initialValues?: LinkFormValues;
  onSave: (values: LinkFormValues) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  isRefreshing?: boolean;
  focusOnMount?: boolean;
  disabled?: boolean;
};

export function LinkForm({ initialValues = emptyValues, onSave, onCancel, submitLabel = "저장하기", isRefreshing = false, focusOnMount = false, disabled = false }: LinkFormProps) {
  const id = useId();
  const { register, handleSubmit, setError, clearErrors, setFocus, formState: { errors, isSubmitting } } = useForm<LinkFormValues>({
    resolver: zodResolver(linkFormSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    defaultValues: initialValues,
  });

  useEffect(() => {
    if (focusOnMount) setFocus("title");
  }, [focusOnMount, setFocus]);

  async function save(values: LinkFormValues) {
    clearErrors("root");
    try {
      await onSave(values);
    } catch {
      setError("root", { message: "링크를 저장하지 못했어요. 연결을 확인하고 다시 시도해 주세요." });
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit(save)} aria-label={onCancel ? "링크 수정" : "링크 추가"} aria-busy={isSubmitting} noValidate>
      <fieldset disabled={isSubmitting || disabled} className="space-y-5">
        {fields.map((field) => {
          const inputId = id + "-" + field.name;
          const errorId = inputId + "-error";
          const hintId = inputId + "-hint";
          return (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={inputId}>{field.label}</Label>
              <Input
                id={inputId}
                type={field.name === "url" ? "url" : "text"}
                inputMode={field.name === "url" ? "url" : undefined}
                autoComplete={field.name === "url" ? "url" : "off"}
                placeholder={field.placeholder}
                className="h-11 rounded-[14px] px-3"
                aria-invalid={Boolean(errors[field.name])}
                aria-describedby={errors[field.name] ? errorId : field.name === "url" ? hintId : undefined}
                {...register(field.name)}
              />
              {field.name === "url" ? <p id={hintId} className="text-xs leading-5 text-muted-foreground">http:// 또는 https://로 시작하는 주소를 입력하세요.</p> : null}
              {errors[field.name] ? <p id={errorId} className="text-xs leading-5 text-destructive" role="alert">{errors[field.name]?.message}</p> : null}
            </div>
          );
        })}
      </fieldset>
      {errors.root ? <p className="text-sm text-destructive" role="alert">{errors.root.message}</p> : null}
      <div className="flex flex-wrap justify-end gap-2 rounded-[18px] bg-muted/60 p-3">
        {onCancel ? <Button type="button" variant="outline" disabled={isSubmitting || disabled} className="h-10 rounded-[14px] px-5" onClick={onCancel}>취소</Button> : null}
        <Button type="submit" disabled={isSubmitting || disabled} className="h-10 rounded-[14px] px-5">
          {isSubmitting ? <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" /> : null}
          <span aria-live="polite">{isSubmitting ? (isRefreshing ? "목록 갱신 중…" : "저장 중…") : submitLabel}</span>
        </Button>
      </div>
    </form>
  );
}
