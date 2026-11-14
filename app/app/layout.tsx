import type { Metadata } from "next";
import { Geist, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { ThreeDProvider } from "@/components/motion";
import { ThemeProvider } from "@/components/ThemeProvider";

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

const themeInitScript = `
(function() {
  try {
    var stored = localStorage.getItem("kavi-theme") || localStorage.getItem("kavi-admin-theme");
    var theme = stored === "light" ? "light" : "dark";
    document.documentElement.dataset.theme = theme;
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${spaceGrotesk.variable} dark`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: themeInitScript,
          }}
        />
      </head>
      <body className="bg-ink text-[#F7F9FC] antialiased selection:bg-blue-600/30 selection:text-white transition-colors duration-200">
        <ThemeProvider>
          <AuthProvider>
            <ThreeDProvider>{children}</ThreeDProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
