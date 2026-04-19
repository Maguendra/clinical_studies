export const runtime = "nodejs";

import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { studies, comments, profiles, likes } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";
import { auth } from "@/auth";
import Link from "next/link";
import SaveButton from "./SaveButton";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function StudyPage({ params }: Props) {
  const { id } = await params;
  const studyId = parseInt(id);
  if (isNaN(studyId)) notFound();

  const [study] = await db.select().from(studies).where(eq(studies.id, studyId));
  if (!study) notFound();

  const session = await auth();

  const studyComments = await db
    .select({
      id: comments.id,
      content: comments.content,
      createdAt: comments.createdAt,
      username: profiles.username,
    })
    .from(comments)
    .leftJoin(profiles, eq(comments.userId, profiles.id))
    .where(eq(comments.studyId, studyId))
    .orderBy(comments.createdAt);

  const [{ value: likeCount }] = await db
    .select({ value: count() })
    .from(likes)
    .where(eq(likes.studyId, studyId));

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 w-full">
      <Link href="/swipe" className="text-slate-500 hover:text-teal-400 text-sm mb-6 inline-block">
        ← Retour au swipe
      </Link>

      <article className="bg-slate-800 border border-slate-700 rounded-3xl p-8 mb-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            {study.domain && (
              <span className="inline-block bg-teal-500/15 text-teal-400 text-xs font-medium px-2.5 py-1 rounded-full mb-3">
                {study.domain}
              </span>
            )}
            <h1 className="text-white font-bold text-2xl leading-snug">{study.title}</h1>
          </div>
          {session && <SaveButton studyId={study.id} />}
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-400 mb-6 pb-6 border-b border-slate-700">
          {study.authors && study.authors.length > 0 && (
            <span>{study.authors.join(", ")}</span>
          )}
          {study.journal && <span className="text-slate-500">{study.journal}</span>}
          {study.year && <span className="text-slate-500">{study.year}</span>}
          {study.pmid && (
            <a
              href={`https://pubmed.ncbi.nlm.nih.gov/${study.pmid}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-500 hover:underline"
            >
              PubMed
            </a>
          )}
          {study.doi && (
            <a
              href={`https://doi.org/${study.doi}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-500 hover:underline"
            >
              DOI
            </a>
          )}
        </div>

        {/* Abstract */}
        {study.abstract ? (
          <div>
            <h2 className="text-slate-300 font-semibold text-sm uppercase tracking-wide mb-3">
              Abstract
            </h2>
            <p className="text-slate-300 leading-relaxed">{study.abstract}</p>
          </div>
        ) : (
          <p className="text-slate-500 italic">Abstract non disponible.</p>
        )}

        {/* Keywords */}
        {study.keywords && study.keywords.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-slate-700">
            {study.keywords.map((kw) => (
              <span key={kw} className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded-md">
                {kw}
              </span>
            ))}
          </div>
        )}

        {/* Likes */}
        <p className="text-slate-500 text-sm mt-4">{likeCount} like{Number(likeCount) !== 1 ? "s" : ""}</p>
      </article>

      {/* Comments */}
      <section>
        <h2 className="text-white font-semibold mb-4">
          Commentaires ({studyComments.length})
        </h2>

        {session ? (
          <CommentForm studyId={study.id} />
        ) : (
          <p className="text-slate-500 text-sm mb-6">
            <Link href="/auth/login" className="text-teal-400 hover:underline">
              Connectez-vous
            </Link>{" "}
            pour laisser un commentaire.
          </p>
        )}

        <div className="space-y-4 mt-6">
          {studyComments.length === 0 && (
            <p className="text-slate-600 text-sm">Aucun commentaire pour l&apos;instant.</p>
          )}
          {studyComments.map((c) => (
            <div key={c.id} className="bg-slate-800 border border-slate-700 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-teal-400 text-sm font-medium">{c.username ?? "Anonyme"}</span>
                <span className="text-slate-600 text-xs">
                  {c.createdAt ? new Date(c.createdAt).toLocaleDateString("fr-FR") : ""}
                </span>
              </div>
              <p className="text-slate-300 text-sm">{c.content}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function CommentForm({ studyId }: { studyId: number }) {
  async function submit(formData: FormData) {
    "use server";
    const content = formData.get("content") as string;
    if (!content?.trim()) return;
    const session = await auth();
    if (!session?.user?.id) return;
    await db.insert(comments).values({
      userId: session.user.id,
      studyId,
      content: content.trim(),
    });
  }

  return (
    <form action={submit} className="space-y-3">
      <textarea
        name="content"
        rows={3}
        placeholder="Votre commentaire sur cette étude…"
        className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors resize-none"
      />
      <button
        type="submit"
        className="bg-teal-500 hover:bg-teal-400 text-slate-900 font-semibold px-5 py-2 rounded-xl text-sm transition-colors"
      >
        Publier
      </button>
    </form>
  );
}
