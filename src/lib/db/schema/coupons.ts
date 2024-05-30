import { sql } from "drizzle-orm";
import {
  text,
  varchar,
  timestamp,
  pgTable,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { nanoid, timestamps } from "@/lib/utils";

export const coupons = pgTable("coupons", {
  id: varchar("coupon_id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  code: varchar("code", { length: 255 }).notNull(),
  discount_amount: integer("discount_amount"),
  expiration_date: timestamp("expiration_date"),
  store: varchar("store", { length: 255 }).notNull(),
  note: text("note"),
  group: varchar("group", { length: 255 }),
  userId: varchar("created_by").notNull(), // Foreign key to User table
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp("updated_at")
    .notNull()
    .default(sql`now()`),
});

const baseCouponSchema = createSelectSchema(coupons);

export const insertCouponSchema = createInsertSchema(coupons);
export const insertCouponParams = baseCouponSchema.extend({}).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});
export const updateCouponSchema = baseCouponSchema;
export const updateCouponParams = baseCouponSchema.extend({}).omit({
  id: true,
});
export const couponIdSchema = baseCouponSchema.pick({ id: true });

export type Coupon = typeof coupons.$inferSelect;
export type NewCoupon = z.infer<typeof insertCouponSchema>;
export type NewCouponParams = z.infer<typeof insertCouponParams>;
export type UpdateCouponParams = z.infer<typeof updateCouponParams>;
export type CouponId = z.infer<typeof couponIdSchema>["id"];
