"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useRef } from "react";

export interface Study {
  id: number;
  pmid: string | null;
  title: string;
  authors: string[] | null;
  abstract: string | null;
  year: number | null;
  journal: string | null;
  doi: string | null;
  domain: string | null;
  keywords: string[] | null;
}

interface Props {
  study: Study;
  onSwipe: (direction: "left" | "right" | "up") => void;
  isTop: boolean;
}

export default function StudyCard({ study, onSwipe, isTop }: Props) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-18, 18]);
  const likeOpacity = useTransform(x, [30, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, -30], [1, 0]);
  const superLikeOpacity = useTransform(y, [-100, -30], [1, 0]);

  const constraintsRef = useRef(null);

  function handleDragEnd(_: unknown, info: { offset: { x: number; y: number } }) {
    const { x: ox, y: oy } = info.offset;
    if (oy < -80 && Math.abs(ox) < 100) {
      animate(y, -600, { duration: 0.3 });
      onSwipe("up");
    } else if (ox > 100) {
      animate(x, 600, { duration: 0.3 });
      onSwipe("right");
    } else if (ox < -100) {
      animate(x, -600, { duration: 0.3 });
      onSwipe("left");
    } else {
      animate(x, 0, { type: "spring", stiffness: 300, damping: 20 });
      animate(y, 0, { type: "spring", stiffness: 300, damping: 20 });
    }
  }

  return (
    <motion.div
      ref={constraintsRef}
      style={{ x, y, rotate, touchAction: "none" }}
      drag={isTop}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
      className={`absolute w-full max-w-sm select-none ${isTop ? "cursor-grab active:cursor-grabbing" : ""}`}
    >
      {/* Feedback labels */}
      {isTop && (
        <>
          <motion.div
            style={{ opacity: likeOpacity }}
            className="absolute top-6 left-6 z-10 rotate-[-20deg] border-4 border-teal-400 text-teal-400 font-black text-2xl px-3 py-1 rounded-lg"
          >
            LIKE
          </motion.div>
          <motion.div
            style={{ opacity: nopeOpacity }}
            className="absolute top-6 right-6 z-10 rotate-[20deg] border-4 border-red-400 text-red-400 font-black text-2xl px-3 py-1 rounded-lg"
          >
            NOPE
          </motion.div>
          <motion.div
            style={{ opacity: superLikeOpacity }}
            className="absolute top-6 left-1/2 -translate-x-1/2 z-10 border-4 border-yellow-400 text-yellow-400 font-black text-2xl px-3 py-1 rounded-lg"
          >
            SUPER
          </motion.div>
        </>
      )}

      <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 shadow-2xl">
        {/* Domain badge */}
        {study.domain && (
          <span className="inline-block bg-teal-500/15 text-teal-400 text-xs font-medium px-2.5 py-1 rounded-full mb-3">
            {study.domain}
          </span>
        )}

        <h2 className="text-white font-bold text-lg leading-snug mb-3 line-clamp-3">
          {study.title}
        </h2>

        {study.authors && study.authors.length > 0 && (
          <p className="text-slate-400 text-sm mb-1">
            {study.authors.slice(0, 3).join(", ")}
            {study.authors.length > 3 && " et al."}
          </p>
        )}

        <p className="text-slate-500 text-sm mb-4">
          {study.journal && <span>{study.journal}</span>}
          {study.year && <span> · {study.year}</span>}
        </p>

        {study.abstract && (
          <p className="text-slate-300 text-sm leading-relaxed line-clamp-4">{study.abstract}</p>
        )}

        {study.keywords && study.keywords.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {study.keywords.slice(0, 4).map((kw) => (
              <span key={kw} className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-md">
                {kw}
              </span>
            ))}
          </div>
        )}

        {study.doi && (
          <a
            href={`https://doi.org/${study.doi}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-block mt-4 text-xs text-teal-500 hover:text-teal-400 underline"
          >
            DOI →
          </a>
        )}
      </div>
    </motion.div>
  );
}
