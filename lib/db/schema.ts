import {
  pgTable,
  serial,
  text,
  varchar,
  smallint,
  integer,
  uuid,
  timestamp,
  date,
  unique,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const studies = pgTable("studies", {
  id: serial("id").primaryKey(),
  pmid: varchar("pmid", { length: 20 }).unique(),
  title: text("title").notNull(),
  authors: text("authors").array(),
  abstract: text("abstract"),
  year: smallint("year"),
  journal: varchar("journal", { length: 255 }),
  doi: varchar("doi", { length: 255 }),
  domain: varchar("domain", { length: 100 }),
  keywords: text("keywords").array(),
  sourceApi: varchar("source_api", { length: 50 }).default("pubmed"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  username: varchar("username", { length: 50 }).unique(),
  speciality: varchar("speciality", { length: 100 }),
  xp: integer("xp").default(0),
  level: smallint("level").default(1),
  streak: smallint("streak").default(0),
  lastActive: date("last_active"),
});

export const swipes = pgTable(
  "swipes",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id").references(() => profiles.id),
    studyId: integer("study_id").references(() => studies.id),
    direction: varchar("direction", { length: 10 }),
    swipedAt: timestamp("swiped_at").defaultNow(),
  },
  (t) => [
    unique().on(t.userId, t.studyId),
    check("direction_check", sql`${t.direction} IN ('left', 'right', 'up')`),
  ]
);

export const likes = pgTable(
  "likes",
  {
    userId: uuid("user_id").references(() => profiles.id),
    studyId: integer("study_id").references(() => studies.id),
    reaction: varchar("reaction", { length: 20 }),
  },
  (t) => [unique().on(t.userId, t.studyId)]
);

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => profiles.id),
  studyId: integer("study_id").references(() => studies.id),
  content: text("content"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => profiles.id),
  badgeType: varchar("badge_type", { length: 50 }),
  earnedAt: timestamp("earned_at").defaultNow(),
});
