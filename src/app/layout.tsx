import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: "백종천 (Jongcheon Baek) - Software Engineer | MyLink",
  description: "사용자 중심의 가치를 코드로 구현하는 풀스택 개발자 백종천의 프로필 및 포트폴리오입니다.",
  openGraph: {
    title: "백종천 - Full Stack Software Engineer",
    description: "새로운 기술을 탐구하고 문제를 해결하는 소프트웨어 엔지니어 백종천입니다.",
    images: ["/images/banner.svg"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
