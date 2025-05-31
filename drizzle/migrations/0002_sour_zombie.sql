ALTER TABLE "account" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "verification" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "verification" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "category" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "category" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "post" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "post" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "subcategory" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "subcategory" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "tag" ALTER COLUMN "created_at" SET NOT NULL;