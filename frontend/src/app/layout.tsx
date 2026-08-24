import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "AI Pulse — Know what happened. Understand why it matters.",
  description:
    "Personalized AI intelligence and learning platform. Get curated AI developments, understand why they matter, and learn what comes next.",
  openGraph: {
    title: "AI Pulse",
    description: "Know what happened. Understand why it matters. Learn what comes next.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
