import { sql } from "drizzle-orm";
import { text, varchar, timestamp, pgTable } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { nanoid, timestamps } from "@/lib/utils";

import { type getFurnitures } from "@/lib/api/furnitures/queries";

export const furnitures = pgTable("furnitures", {
  id: varchar("id", { length: 191 })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  type: text("type").notNull(),
  userId: varchar("user_id", { length: 256 }).notNull(),
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp("updated_at")
    .notNull()
    .default(sql`now()`),
});

// Schema for furnitures - used to validate API requests
const baseSchema = createSelectSchema(furnitures).omit(timestamps);

export const insertFurnitureSchema =
  createInsertSchema(furnitures).omit(timestamps);
export const insertFurnitureParams = baseSchema.extend({}).omit({
  id: true,
  userId: true,
});

export const updateFurnitureSchema = baseSchema;
export const updateFurnitureParams = baseSchema.extend({}).omit({
  userId: true,
});
export const furnitureIdSchema = baseSchema.pick({ id: true });

// Types for furnitures - used to type API request params and within Components
export type Furniture = typeof furnitures.$inferSelect;
export type NewFurniture = z.infer<typeof insertFurnitureSchema>;
export type NewFurnitureParams = z.infer<typeof insertFurnitureParams>;
export type UpdateFurnitureParams = z.infer<typeof updateFurnitureParams>;
export type FurnitureId = z.infer<typeof furnitureIdSchema>["id"];

// this type infers the return from getFurnitures() - meaning it will include any joins
export type CompleteFurniture = Awaited<
  ReturnType<typeof getFurnitures>
>["furnitures"][number];
