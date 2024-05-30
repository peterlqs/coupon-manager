import { db } from "@/lib/db/index";
import { eq, and } from "drizzle-orm";
import { getUserAuth } from "@/lib/auth/utils";
import { type ModelId, modelIdSchema, models } from "@/lib/db/schema/models";
import { furnitures } from "@/lib/db/schema/furnitures";

export const getModels = async () => {
  const { session } = await getUserAuth();
  const rows = await db.select({ model: models, furniture: furnitures }).from(models).leftJoin(furnitures, eq(models.furnitureId, furnitures.id)).where(eq(models.userId, session?.user.id!));
  const m = rows .map((r) => ({ ...r.model, furniture: r.furniture})); 
  return { models: m };
};

export const getModelById = async (id: ModelId) => {
  const { session } = await getUserAuth();
  const { id: modelId } = modelIdSchema.parse({ id });
  const [row] = await db.select({ model: models, furniture: furnitures }).from(models).where(and(eq(models.id, modelId), eq(models.userId, session?.user.id!))).leftJoin(furnitures, eq(models.furnitureId, furnitures.id));
  if (row === undefined) return {};
  const m =  { ...row.model, furniture: row.furniture } ;
  return { model: m };
};


