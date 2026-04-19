import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();
  if (session) redirect("/swipe");

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
      <div className="max-w-2xl">
        <span className="inline-block bg-teal-500/10 text-teal-400 text-sm font-medium px-3 py-1 rounded-full mb-6">
          Bêta — Accès libre
        </span>
        <h1 className="text-5xl font-bold text-white mb-4 leading-tight">
          Swipez des études cliniques
        </h1>
        <p className="text-slate-400 text-xl mb-10">
          Découvrez, sauvegardez et partagez des études scientifiques comme vous utiliseriez Tinder.
          Gagnez des points, gardez votre streak, progressez chaque jour.
        </p>
        <Link
          href="/auth/login"
          className="inline-block bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold text-lg px-8 py-4 rounded-2xl transition-colors"
        >
          Commencer gratuitement →
        </Link>
      </div>
    </div>
  );
}
