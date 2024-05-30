import { db } from "@/lib/db/index";
import { and, eq } from "drizzle-orm";
import { 
  ModelId, 
  NewModelParams,
  UpdateModelParams, 
  updateModelSchema,
  insertModelSchema, 
  models,
  modelIdSchema 
} from "@/lib/db/schema/models";
import { getUserAuth } from "@/lib/auth/utils";

export const createModel = async (model: NewModelParams) => {
  const { session } = await getUserAuth();
  const newModel = insertModelSchema.parse({ ...model, userId: session?.user.id! });
  try {
    const [m] =  await db.insert(models).values(newModel).returning();
    return { model: m };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

export const updateModel = async (id: ModelId, model: UpdateModelParams) => {
  const { session } = await getUserAuth();
  const { id: modelId } = modelIdSchema.parse({ id });
  const newModel = updateModelSchema.parse({ ...model, userId: session?.user.id! });
  try {
    const [m] =  await db
     .update(models)
     .set(newModel)
     .where(and(eq(models.id, modelId!), eq(models.userId, session?.user.id!)))
     .returning();
    return { model: m };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

export const deleteModel = async (id: ModelId) => {
  const { session } = await getUserAuth();
  const { id: modelId } = modelIdSchema.parse({ id });
  try {
    const [m] =  await db.delete(models).where(and(eq(models.id, modelId!), eq(models.userId, session?.user.id!)))
    .returning();
    return { model: m };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

