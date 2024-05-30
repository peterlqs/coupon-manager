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

export const groups = pgTable("groups", {
  id: varchar("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  name: text("name").notNull(),
  description: text("description"),
  userId: varchar("user_id", { length: 256 }).notNull(),
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp("updated_at")
    .notNull()
    .default(sql`now()`),
});

const baseGroupSchema = createSelectSchema(groups);

export const insertGroupSchema = createInsertSchema(groups);
export const insertGroupParams = baseGroupSchema.extend({}).omit({
  id: true,
});
export const updateGroupSchema = baseGroupSchema;
export const updateGroupParams = baseGroupSchema.extend({}).omit({
  id: true,
});
export const groupIdSchema = baseGroupSchema.pick({ id: true });

export type Group = typeof groups.$inferSelect;
export type NewGroup = z.infer<typeof insertGroupSchema>;
export type NewGroupParams = z.infer<typeof insertGroupParams>;
export type UpdateGroupParams = z.infer<typeof updateGroupParams>;
export type GroupId = z.infer<typeof groupIdSchema>["id"];
