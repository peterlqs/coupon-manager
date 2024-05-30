"use server";

import { revalidatePath } from "next/cache";
import {
  createModel,
  deleteModel,
  updateModel,
} from "@/lib/api/models/mutations";
import {
  ModelId,
  NewModelParams,
  UpdateModelParams,
  modelIdSchema,
  insertModelParams,
  updateModelParams,
} from "@/lib/db/schema/models";

const handleErrors = (e: unknown) => {
  const errMsg = "Error, please try again.";
  if (e instanceof Error) return e.message.length > 0 ? e.message : errMsg;
  if (e && typeof e === "object" && "error" in e) {
    const errAsStr = e.error as string;
    return errAsStr.length > 0 ? errAsStr : errMsg;
  }
  return errMsg;
};

const revalidateModels = () => revalidatePath("/models");

export const createModelAction = async (input: NewModelParams) => {
  try {
    const payload = insertModelParams.parse(input);
    await createModel(payload);
    revalidateModels();
  } catch (e) {
    return handleErrors(e);
  }
};

export const updateModelAction = async (input: UpdateModelParams) => {
  try {
    const payload = updateModelParams.parse(input);
    await updateModel(payload.id, payload);
    revalidateModels();
  } catch (e) {
    return handleErrors(e);
  }
};

export const deleteModelAction = async (input: ModelId) => {
  try {
    const payload = modelIdSchema.parse({ id: input });
    await deleteModel(payload.id);
    revalidateModels();
  } catch (e) {
    return handleErrors(e);
  }
};