CREATE TABLE "badges" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid,
	"badge_type" varchar(50),
	"earned_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid,
	"study_id" integer,
	"content" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "likes" (
	"user_id" uuid,
	"study_id" integer,
	"reaction" varchar(20),
	CONSTRAINT "likes_user_id_study_id_unique" UNIQUE("user_id","study_id")
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"username" varchar(50),
	"speciality" varchar(100),
	"xp" integer DEFAULT 0,
	"level" smallint DEFAULT 1,
	"streak" smallint DEFAULT 0,
	"last_active" date,
	CONSTRAINT "profiles_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "studies" (
	"id" serial PRIMARY KEY NOT NULL,
	"pmid" varchar(20),
	"title" text NOT NULL,
	"authors" text[],
	"abstract" text,
	"year" smallint,
	"journal" varchar(255),
	"doi" varchar(255),
	"domain" varchar(100),
	"keywords" text[],
	"source_api" varchar(50) DEFAULT 'pubmed',
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "studies_pmid_unique" UNIQUE("pmid")
);
--> statement-breakpoint
CREATE TABLE "swipes" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid,
	"study_id" integer,
	"direction" varchar(10),
	"swiped_at" timestamp DEFAULT now(),
	CONSTRAINT "swipes_user_id_study_id_unique" UNIQUE("user_id","study_id"),
	CONSTRAINT "direction_check" CHECK ("swipes"."direction" IN ('left', 'right', 'up'))
);
--> statement-breakpoint
ALTER TABLE "badges" ADD CONSTRAINT "badges_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_study_id_studies_id_fk" FOREIGN KEY ("study_id") REFERENCES "public"."studies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "likes" ADD CONSTRAINT "likes_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "likes" ADD CONSTRAINT "likes_study_id_studies_id_fk" FOREIGN KEY ("study_id") REFERENCES "public"."studies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "swipes" ADD CONSTRAINT "swipes_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "swipes" ADD CONSTRAINT "swipes_study_id_studies_id_fk" FOREIGN KEY ("study_id") REFERENCES "public"."studies"("id") ON DELETE no action ON UPDATE no action;