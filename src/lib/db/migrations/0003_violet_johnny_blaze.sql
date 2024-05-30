ALTER TABLE "coupons" ALTER COLUMN "discount_amount" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "coupons" ALTER COLUMN "store" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "coupons" ADD COLUMN "note" text;