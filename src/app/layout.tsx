import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = { title: "AI Meeting Summarizer", description: "Summarize & share meeting notes" };


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0b0b0c] font-sans text-[#eaeaea]">
        <div className="mx-auto max-w-3xl px-6 py-10">
          <h1 className="text-2xl font-bold">AI Meeting Notes — Summarize & Share</h1>
          <p className="mt-2 text-gray-400">
            Paste transcript → add instruction → generate → edit → email
          </p>
          <div className="mt-6">{children}</div>
        </div>
      </body>
    </html>
  );
}
