import { z } from "zod";

export function isSafeExternalUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export const linkFormSchema = z.object({
  title: z.string().trim().min(1, "링크 제목을 입력해 주세요.").max(50, "링크 제목은 50자 이하로 입력해 주세요."),
  url: z.string().trim().min(1, "URL을 입력해 주세요.").refine(
    (value) => value.length === 0 || isSafeExternalUrl(value),
    "http:// 또는 https://로 시작하는 올바른 URL을 입력해 주세요.",
  ),
  description: z.string().trim().max(100, "설명은 100자 이하로 입력해 주세요."),
});

export type LinkFormValues = z.infer<typeof linkFormSchema>;
