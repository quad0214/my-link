import { z } from "zod";

const reserved = new Set(["mypage", "u", "api", "_next", "favicon.ico", "robots.txt", "sitemap.xml"]);
export const displaynameSchema = z.string().trim().toLowerCase().min(1, "아이디를 입력해 주세요.")
  .max(40, "아이디는 40자 이하로 입력해 주세요.")
  .regex(/^[a-z0-9][a-z0-9._-]*$/, "아이디는 영문 소문자·숫자로 시작하고 점, 밑줄, 하이픈을 사용할 수 있어요.")
  .refine((value) => !reserved.has(value), "이 아이디는 사용할 수 없습니다.");
export const profileFormSchema = z.object({
  username: z.string().trim().min(1, "이름을 입력해 주세요.").max(100, "이름은 100자 이하로 입력해 주세요."),
  displayname: displaynameSchema,
  bio: z.string().trim().max(500, "소개글은 500자 이하로 입력해 주세요."),
});
export type ProfileFormValues = z.infer<typeof profileFormSchema>;
export const displayNameKey = (name: string) => displaynameSchema.parse(name);
export const profilePath = (displayname: string) => "/" + encodeURIComponent(displayname);
