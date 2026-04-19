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
  primaryKey,
  boolean,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import type { AdapterAccountType } from "next-auth/adapters";

// --- Auth.js tables ---

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (t) => [primaryKey({ columns: [t.provider, t.providerAccountId] })]
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.identifier, t.token] })]
);

// --- App tables ---

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
  id: uuid("id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
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
    userId: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }),
    studyId: integer("study_id").references(() => studies.id, { onDelete: "cascade" }),
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
    userId: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }),
    studyId: integer("study_id").references(() => studies.id, { onDelete: "cascade" }),
    reaction: varchar("reaction", { length: 20 }),
  },
  (t) => [primaryKey({ columns: [t.userId, t.studyId] })]
);

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }),
  studyId: integer("study_id").references(() => studies.id, { onDelete: "cascade" }),
  content: text("content"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }),
  badgeType: varchar("badge_type", { length: 50 }),
  earnedAt: timestamp("earned_at").defaultNow(),
});
