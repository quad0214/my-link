import type { Metadata } from "next";
import { FirebaseAnalytics } from "@/components/firebase-analytics";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: "MyLink — 나의 모든 링크를 한곳에",
  description: "프로필과 다양한 채널을 하나의 링크로 공유하는 마이링크입니다.",
  openGraph: {
    title: "MyLink — 나의 모든 링크를 한곳에",
    description: "프로필과 다양한 채널을 하나의 링크로 공유하는 마이링크입니다.",
    images: ["/images/banner.svg"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className="h-full font-sans antialiased"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
        <FirebaseAnalytics />
        <Toaster />
      </body>
    </html>
  );
}
