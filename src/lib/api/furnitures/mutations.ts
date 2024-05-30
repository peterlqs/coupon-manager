import { db } from "@/lib/db/index";
import { and, eq } from "drizzle-orm";
import {
  FurnitureId,
  NewFurnitureParams,
  UpdateFurnitureParams,
  updateFurnitureSchema,
  insertFurnitureSchema,
  furnitures,
  furnitureIdSchema,
} from "@/lib/db/schema/furnitures";
import { getUserAuth } from "@/lib/auth/utils";

export const createFurniture = async (furniture: NewFurnitureParams) => {
  const { session } = await getUserAuth();
  const newFurniture = insertFurnitureSchema.parse({
    ...furniture,
    userId: session?.user.id!,
  });
  console.log("newFurniture", newFurniture);
  try {
    const [f] = await db.insert(furnitures).values(newFurniture).returning();
    return { furniture: f };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

export const updateFurniture = async (
  id: FurnitureId,
  furniture: UpdateFurnitureParams
) => {
  const { session } = await getUserAuth();
  const { id: furnitureId } = furnitureIdSchema.parse({ id });
  const newFurniture = updateFurnitureSchema.parse({
    ...furniture,
    userId: session?.user.id!,
  });
  try {
    const [f] = await db
      .update(furnitures)
      .set({ ...newFurniture, updatedAt: new Date() })
      .where(
        and(
          eq(furnitures.id, furnitureId!),
          eq(furnitures.userId, session?.user.id!)
        )
      )
      .returning();
    return { furniture: f };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

export const deleteFurniture = async (id: FurnitureId) => {
  const { session } = await getUserAuth();
  const { id: furnitureId } = furnitureIdSchema.parse({ id });
  try {
    const [f] = await db
      .delete(furnitures)
      .where(
        and(
          eq(furnitures.id, furnitureId!),
          eq(furnitures.userId, session?.user.id!)
        )
      )
      .returning();
    return { furniture: f };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};
