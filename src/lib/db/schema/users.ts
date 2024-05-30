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

export const users = pgTable("users", {
  id: varchar("user_id").primaryKey(),
  name: text("name").notNull(),
  email: varchar("email", { length: 255 }).notNull(),
});

const baseSchema = createSelectSchema(users);

export const insertUserSchema = createInsertSchema(users);
export const insertUserParams = baseSchema.extend({}).omit({
  id: true,
});
export const updateUserSchema = baseSchema;
export const updateUserParams = baseSchema.extend({}).omit({
  id: true,
});
export const userIdSchema = baseSchema.pick({ id: true });

export type User = typeof users.$inferSelect;
export type NewUser = z.infer<typeof insertUserSchema>;
export type NewUserParams = z.infer<typeof insertUserParams>;
export type UpdateUserParams = z.infer<typeof updateUserParams>;
export type UserId = z.infer<typeof userIdSchema>["id"];
