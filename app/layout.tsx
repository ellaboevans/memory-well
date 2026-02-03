import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ConvexClientProvider } from "@/lib/convex-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Memory Well — Digital Guestbooks That Last Forever",
  description:
    "Create beautiful, immutable digital guestbooks for weddings, memorials, milestones, and more. Preserve signatures, messages, and memories with integrity.",
  keywords: [
    "digital guestbook",
    "online guestbook",
    "wedding guestbook",
    "memorial guestbook",
    "signature wall",
  ],
  authors: [{ name: "Memory Well" }],
  openGraph: {
    title: "Memory Well — Digital Guestbooks That Last Forever",
    description:
      "Create beautiful, immutable digital guestbooks for weddings, memorials, milestones, and more.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
