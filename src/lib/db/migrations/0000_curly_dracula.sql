CREATE TYPE "public"."confidence" AS ENUM('high', 'low', 'manual');--> statement-breakpoint
CREATE TYPE "public"."data_source_type" AS ENUM('website', 'pdf', 'image');--> statement-breakpoint
CREATE TYPE "public"."mosque_status" AS ENUM('active', 'unverified', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."source_type" AS ENUM('website', 'pdf', 'image', 'manual');--> statement-breakpoint
CREATE TABLE "amenities" (
	"mosque_id" integer PRIMARY KEY NOT NULL,
	"has_womens_space" boolean DEFAULT false NOT NULL,
	"has_car_park" boolean DEFAULT false NOT NULL,
	"has_disability_access" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contact_info" (
	"mosque_id" integer PRIMARY KEY NOT NULL,
	"website" text,
	"phone" text,
	"email" text
);
--> statement-breakpoint
CREATE TABLE "data_source" (
	"id" serial PRIMARY KEY NOT NULL,
	"mosque_id" integer NOT NULL,
	"url" text NOT NULL,
	"type" "data_source_type" NOT NULL,
	"last_attempt_at" timestamp,
	"last_success_at" timestamp,
	"last_error" text
);
--> statement-breakpoint
CREATE TABLE "favourite" (
	"user_id" integer NOT NULL,
	"mosque_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "favourite_user_id_mosque_id_pk" PRIMARY KEY("user_id","mosque_id")
);
--> statement-breakpoint
CREATE TABLE "location" (
	"mosque_id" integer PRIMARY KEY NOT NULL,
	"address_line_1" text NOT NULL,
	"address_line_2" text,
	"town" text NOT NULL,
	"postcode" text NOT NULL,
	"lat" double precision NOT NULL,
	"lng" double precision NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mosque" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"status" "mosque_status" DEFAULT 'unverified' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "mosque_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "prayer_times" (
	"id" serial PRIMARY KEY NOT NULL,
	"mosque_id" integer NOT NULL,
	"date" date NOT NULL,
	"fajr_start" text,
	"fajr_jamaat" text,
	"zuhr_start" text,
	"zuhr_jamaat" text,
	"asr_start" text,
	"asr_alt_start" text,
	"asr_jamaat" text,
	"maghrib_start" text,
	"maghrib_jamaat" text,
	"isha_start" text,
	"isha_jamaat" text,
	"source" text,
	"source_type" "source_type",
	"last_verified_at" timestamp,
	"confidence" "confidence",
	CONSTRAINT "prayer_times_mosque_id_date_unique" UNIQUE("mosque_id","date")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"profile_picture" text,
	"google_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "user_google_id_unique" UNIQUE("google_id")
);
--> statement-breakpoint
ALTER TABLE "amenities" ADD CONSTRAINT "amenities_mosque_id_mosque_id_fk" FOREIGN KEY ("mosque_id") REFERENCES "public"."mosque"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contact_info" ADD CONSTRAINT "contact_info_mosque_id_mosque_id_fk" FOREIGN KEY ("mosque_id") REFERENCES "public"."mosque"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "data_source" ADD CONSTRAINT "data_source_mosque_id_mosque_id_fk" FOREIGN KEY ("mosque_id") REFERENCES "public"."mosque"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favourite" ADD CONSTRAINT "favourite_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favourite" ADD CONSTRAINT "favourite_mosque_id_mosque_id_fk" FOREIGN KEY ("mosque_id") REFERENCES "public"."mosque"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "location" ADD CONSTRAINT "location_mosque_id_mosque_id_fk" FOREIGN KEY ("mosque_id") REFERENCES "public"."mosque"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prayer_times" ADD CONSTRAINT "prayer_times_mosque_id_mosque_id_fk" FOREIGN KEY ("mosque_id") REFERENCES "public"."mosque"("id") ON DELETE no action ON UPDATE no action;