CREATE TYPE "public"."experience_type" AS ENUM('work', 'education');--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('completed', 'in_progress', 'archived');--> statement-breakpoint
CREATE TYPE "public"."skill_category" AS ENUM('language', 'framework', 'tool', 'database', 'design', 'other');--> statement-breakpoint
CREATE TABLE "contact_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"subject" varchar(255),
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "experiences" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" "experience_type" NOT NULL,
	"company" varchar(255) NOT NULL,
	"role" varchar(255) NOT NULL,
	"description" text,
	"location" varchar(255),
	"company_url" text,
	"company_logo_url" text,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"is_current" boolean DEFAULT false,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "guestbook" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"author_name" varchar(255) NOT NULL,
	"author_email" varchar(255),
	"author_avatar_url" text,
	"message" text NOT NULL,
	"is_approved" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "profile" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"bio" text,
	"short_bio" text,
	"profile_image_url" text,
	"resume_url" text,
	"email" varchar(255),
	"location" varchar(255),
	"available_for_hire" boolean DEFAULT false,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"long_description" text,
	"image_url" text,
	"live_url" text,
	"repo_url" text,
	"tags" json DEFAULT '[]'::json,
	"is_featured" boolean DEFAULT false,
	"status" "project_status" DEFAULT 'completed',
	"sort_order" integer DEFAULT 0,
	"start_date" timestamp,
	"end_date" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "projects_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "skills" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"icon" varchar(100),
	"category" "skill_category" DEFAULT 'other',
	"proficiency" integer DEFAULT 50,
	"sort_order" integer DEFAULT 0,
	"is_visible" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "social_links" (
	"id" serial PRIMARY KEY NOT NULL,
	"platform" varchar(50) NOT NULL,
	"url" text NOT NULL,
	"icon" varchar(50),
	"sort_order" integer DEFAULT 0,
	"is_visible" boolean DEFAULT true
);
--> statement-breakpoint
CREATE INDEX "projects_slug_idx" ON "projects" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "projects_featured_idx" ON "projects" USING btree ("is_featured");