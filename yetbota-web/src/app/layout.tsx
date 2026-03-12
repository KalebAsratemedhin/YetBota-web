import type { Metadata } from "next";
import { Inter } from "next/font/google";
import './globals.css';
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Yet Bota – Digital Address & Local Discovery",
  description:
    "Community-contributed location discovery platform aligned with Ethiopia's Digital 2030 strategy.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.className} bg-[#0a0a0a] text-white antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}