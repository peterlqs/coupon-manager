ALTER TABLE "user_groups" ADD COLUMN "user_email" varchar;--> statement-breakpoint
ALTER TABLE "groups" ADD COLUMN "user_id" varchar(256) NOT NULL;--> statement-breakpoint
ALTER TABLE "groups" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "groups" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;