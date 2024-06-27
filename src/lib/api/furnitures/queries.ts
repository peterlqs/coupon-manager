import { db } from "@/lib/db/index";
import { eq, and } from "drizzle-orm";
import { getUserAuth } from "@/lib/auth/utils";
import {
  type FurnitureId,
  furnitureIdSchema,
  furnitures,
} from "@/lib/db/schema/furnitures";
import { models, type CompleteModel } from "@/lib/db/schema/models";

export const getFurnitures = async () => {
  const { session } = await getUserAuth();
  const rows = await db
    .select()
    .from(furnitures)
    .where(eq(furnitures.userId, session?.user.id!));
  const f = rows;
  return { furnitures: f };
};

export const getFurnitureById = async (id: FurnitureId) => {
  const { session } = await getUserAuth();
  const { id: furnitureId } = furnitureIdSchema.parse({ id });
  const [row] = await db
    .select()
    .from(furnitures)
    .where(
      and(
        eq(furnitures.id, furnitureId),
        eq(furnitures.userId, session?.user.id!)
      )
    );
  if (row === undefined) return {};
  const f = row;
  return { furniture: f };
};

export const getFurnitureByIdWithModels = async (id: FurnitureId) => {
  const { session } = await getUserAuth();
  const { id: furnitureId } = furnitureIdSchema.parse({ id });
  const rows = await db
    .select({ furniture: furnitures, model: models })
    .from(furnitures)
    .where(
      and(
        eq(furnitures.id, furnitureId),
        eq(furnitures.userId, session?.user.id!)
      )
    )
    .leftJoin(models, eq(furnitures.id, models.furnitureId));
  if (rows.length === 0) return {};
  const f = rows[0].furniture;
  const fm = rows
    .filter((r) => r.model !== null)
    .map((m) => m.model) as CompleteModel[];

  return { furniture: f, models: fm };
};
