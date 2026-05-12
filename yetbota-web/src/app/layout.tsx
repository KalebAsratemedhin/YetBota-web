import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Yet Bota – Digital Address & Local Discovery",
  description:
    "Community-contributed location discovery platform aligned with Ethiopia's Digital 2030 strategy.",
};

const themeInitScript = `(() => {
  try {
    const saved = localStorage.getItem('yetbota.theme');
    const sysDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = saved ? saved === 'dark' : true; // default to dark when no preference saved
    void sysDark;
    document.documentElement.classList.toggle('dark', isDark);
  } catch (_) {
    document.documentElement.classList.add('dark');
  }
})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body
        className={`${inter.className} bg-bg text-fg antialiased`}
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}