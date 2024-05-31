"use server";

import { revalidatePath } from "next/cache";
import {
  createGroup,
  deleteGroup,
  updateGroup,
} from "@/lib/api/groups/mutation";
import {
  GroupId,
  NewGroupParams,
  UpdateGroupParams,
  groupIdSchema,
  insertGroupParams,
  insertGroupSchema,
  updateGroupSchema,
} from "@/lib/db/schema/groups";

const handleErrors = (e: unknown) => {
  const errMsg = "Error, please try again.";
  if (e instanceof Error) return e.message.length > 0 ? e.message : errMsg;
  if (e && typeof e === "object" && "error" in e) {
    const errAsStr = e.error as string;
    return errAsStr.length > 0 ? errAsStr : errMsg;
  }
  return errMsg;
};

const revalidateGroups = () => revalidatePath("/groups");

export const createGroupAction = async (input: NewGroupParams) => {
  try {
    const payload = insertGroupParams.parse(input);
    // await createGroup(payload);
    const result = await createGroup(payload);
    revalidateGroups();
    return result.group;
  } catch (e) {
    return handleErrors(e);
  }
};

export const updateGroupAction = async (input: UpdateGroupParams) => {
  try {
    const payload = updateGroupSchema.parse(input);
    await updateGroup(payload.id, payload);
    revalidateGroups();
  } catch (e) {
    return handleErrors(e);
  }
};

export const deleteGroupAction = async (input: GroupId) => {
  try {
    const payload = groupIdSchema.parse({ id: input });
    await deleteGroup(payload.id);
    revalidateGroups();
  } catch (e) {
    return handleErrors(e);
  }
};
