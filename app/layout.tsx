import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { auth } from "@/auth";
import Navbar from "@/components/Navbar";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: "ClinSwipe — Études cliniques",
  description: "Découvrez des études cliniques en swipant, comme Tinder pour la recherche médicale.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  return (
    <html lang="fr" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full bg-slate-900 text-white flex flex-col">
        <Navbar session={session} />
        <main className="flex-1 flex flex-col">{children}</main>
      </body>
    </html>
  );
}
