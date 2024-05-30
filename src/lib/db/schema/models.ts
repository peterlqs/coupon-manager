import { text, varchar, pgTable } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { furnitures } from "./furnitures"
import { type getModels } from "@/lib/api/models/queries";

import { nanoid } from "@/lib/utils";


export const models = pgTable('models', {
  id: varchar("id", { length: 191 }).primaryKey().$defaultFn(() => nanoid()),
  name: text("name").notNull(),
  furnitureId: varchar("furniture_id", { length: 256 }).references(() => furnitures.id, { onDelete: "cascade" }).notNull(),
  userId: varchar("user_id", { length: 256 }).notNull()
});


// Schema for models - used to validate API requests
const baseSchema = createSelectSchema(models)

export const insertModelSchema = createInsertSchema(models);
export const insertModelParams = baseSchema.extend({
  furnitureId: z.coerce.string().min(1)
}).omit({ 
  id: true,
  userId: true
});

export const updateModelSchema = baseSchema;
export const updateModelParams = baseSchema.extend({
  furnitureId: z.coerce.string().min(1)
}).omit({ 
  userId: true
});
export const modelIdSchema = baseSchema.pick({ id: true });

// Types for models - used to type API request params and within Components
export type Model = typeof models.$inferSelect;
export type NewModel = z.infer<typeof insertModelSchema>;
export type NewModelParams = z.infer<typeof insertModelParams>;
export type UpdateModelParams = z.infer<typeof updateModelParams>;
export type ModelId = z.infer<typeof modelIdSchema>["id"];
    
// this type infers the return from getModels() - meaning it will include any joins
export type CompleteModel = Awaited<ReturnType<typeof getModels>>["models"][number];

