import type { Metadata } from "next";
import { Geist, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { ThreeDProvider } from "@/components/motion";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kavi Solutions — Ideas become experiences. We engineer the rest.",
  description:
    "Kavi Solutions is a full-stack digital studio crafting high-velocity web systems, native mobile platforms, applied AI products and compounding growth loops.",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${spaceGrotesk.variable} dark`}>
      <body className="bg-ink text-[#F7F9FC] antialiased selection:bg-blue-600/30 selection:text-white">
        <AuthProvider>
          <ThreeDProvider>{children}</ThreeDProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
