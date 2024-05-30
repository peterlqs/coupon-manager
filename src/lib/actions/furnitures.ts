"use server";

import { revalidatePath } from "next/cache";
import {
  createFurniture,
  deleteFurniture,
  updateFurniture,
} from "@/lib/api/furnitures/mutations";
import {
  FurnitureId,
  NewFurnitureParams,
  UpdateFurnitureParams,
  furnitureIdSchema,
  insertFurnitureParams,
  updateFurnitureParams,
} from "@/lib/db/schema/furnitures";

const handleErrors = (e: unknown) => {
  const errMsg = "Error, please try again.";
  if (e instanceof Error) return e.message.length > 0 ? e.message : errMsg;
  if (e && typeof e === "object" && "error" in e) {
    const errAsStr = e.error as string;
    return errAsStr.length > 0 ? errAsStr : errMsg;
  }
  return errMsg;
};

const revalidateFurnitures = () => revalidatePath("/furnitures");

export const createFurnitureAction = async (input: NewFurnitureParams) => {
  try {
    const payload = insertFurnitureParams.parse(input);
    await createFurniture(payload);
    revalidateFurnitures();
  } catch (e) {
    return handleErrors(e);
  }
};

export const updateFurnitureAction = async (input: UpdateFurnitureParams) => {
  try {
    const payload = updateFurnitureParams.parse(input);
    await updateFurniture(payload.id, payload);
    revalidateFurnitures();
  } catch (e) {
    return handleErrors(e);
  }
};

export const deleteFurnitureAction = async (input: FurnitureId) => {
  try {
    const payload = furnitureIdSchema.parse({ id: input });
    await deleteFurniture(payload.id);
    revalidateFurnitures();
  } catch (e) {
    return handleErrors(e);
  }
};