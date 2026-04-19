export const runtime = "nodejs";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { profiles, swipes, badges } from "@/lib/db/schema";
import { eq, and, inArray, count } from "drizzle-orm";

const LEVELS = ["Intern", "Resident", "Fellow", "Attending", "Chief", "Professor"];
function getLevel(xp: number) {
  const idx = Math.min(Math.floor(xp / 100), LEVELS.length - 1);
  return { name: LEVELS[idx], next: (idx + 1) * 100, current: idx * 100 };
}

export default async function MePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, session.user.id));

  if (!profile) redirect("/auth/login");

  const [{ value: saved }] = await db
    .select({ value: count() })
    .from(swipes)
    .where(and(eq(swipes.userId, session.user.id), inArray(swipes.direction, ["right", "up"])));

  const [{ value: total }] = await db
    .select({ value: count() })
    .from(swipes)
    .where(eq(swipes.userId, session.user.id));

  const userBadges = await db
    .select()
    .from(badges)
    .where(eq(badges.userId, session.user.id));

  const xp = profile.xp ?? 0;
  const level = getLevel(xp);
  const progress = Math.round(((xp - level.current) / (level.next - level.current)) * 100);

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 w-full">
      <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 text-2xl font-bold">
            {session.user.name?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div>
            <h1 className="text-white font-bold text-xl">{session.user.name ?? "Utilisateur"}</h1>
            <p className="text-slate-400 text-sm">{session.user.email}</p>
            {profile.speciality && (
              <p className="text-teal-400 text-xs mt-0.5">{profile.speciality}</p>
            )}
          </div>
        </div>

        {/* Level & XP */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-300 font-medium">{level.name}</span>
            <span className="text-slate-500">{xp} XP</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-500 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-slate-500 text-xs mt-1">
            {level.next - xp} XP pour le niveau suivant
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Swipes total", value: total },
            { label: "Sauvegardées", value: saved },
            { label: "Streak", value: `${profile.streak ?? 0}🔥` },
          ].map((s) => (
            <div key={s.label} className="bg-slate-900 rounded-2xl p-4 text-center">
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-slate-500 text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Badges */}
      <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6">
        <h2 className="text-white font-semibold mb-4">Badges</h2>
        {userBadges.length === 0 ? (
          <p className="text-slate-500 text-sm">Swipez des études pour débloquer vos premiers badges.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {userBadges.map((b) => (
              <span key={b.id} className="bg-teal-500/10 text-teal-400 text-sm px-3 py-1 rounded-full">
                {b.badgeType}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
