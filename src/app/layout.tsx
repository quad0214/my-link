import type { Metadata } from "next";
import { FirebaseAnalytics } from "@/components/firebase-analytics";
import { QueryProvider } from "@/components/query-provider";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import { siteDescription, siteTitle, siteUrl } from "@/lib/site-metadata";

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: siteTitle,
  description: siteDescription,
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    siteName: "MyLink",
    locale: "ko_KR",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: siteTitle, description: siteDescription },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className="h-full font-sans antialiased"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <QueryProvider>
          {children}
          <FirebaseAnalytics />
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}
