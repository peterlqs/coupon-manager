import { sql } from "drizzle-orm";
import { text, varchar, timestamp, pgTable } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { nanoid, timestamps } from "@/lib/utils";
import { users } from "./users";
import { groups } from "./groups";
import { coupons } from "./coupons";

export const user_groups = pgTable("user_groups", {
  user_id: varchar("user_id").references(() => users.id),
  group_id: varchar("group_id").references(() => groups.id),
  user_email: varchar("user_email"),
});

// Coupon_Group Table (Associative)
export const coupon_groups = pgTable("coupon_groups", {
  coupon_id: varchar("coupon_id").references(() => coupons.id),
  group_id: varchar("group_id").references(() => groups.id),
});
