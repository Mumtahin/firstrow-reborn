ALTER TABLE "amenities" ALTER COLUMN "has_womens_space" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "amenities" ALTER COLUMN "has_womens_space" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "amenities" ALTER COLUMN "has_car_park" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "amenities" ALTER COLUMN "has_car_park" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "amenities" ALTER COLUMN "has_disability_access" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "amenities" ALTER COLUMN "has_disability_access" DROP NOT NULL;