"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Session } from "next-auth";
import { signOut } from "next-auth/react";

export default function Navbar({ session }: { session: Session | null }) {
  const path = usePathname();

  const links = [
    { href: "/swipe", label: "Swipe" },
    { href: "/search", label: "Recherche" },
    { href: "/library", label: "Bibliothèque" },
    { href: "/me", label: "Profil" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur border-b border-slate-800">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-teal-400 tracking-tight text-lg">
          ClinSwipe
        </Link>

        {session ? (
          <div className="flex items-center gap-6">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`text-sm transition-colors ${
                  path.startsWith(l.href)
                    ? "text-teal-400 font-medium"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-sm text-slate-400 hover:text-red-400 transition-colors"
            >
              Déconnexion
            </button>
          </div>
        ) : (
          <Link
            href="/auth/login"
            className="text-sm bg-teal-500 hover:bg-teal-400 text-slate-900 font-semibold px-4 py-1.5 rounded-full transition-colors"
          >
            Connexion
          </Link>
        )}
      </div>
    </nav>
  );
}
