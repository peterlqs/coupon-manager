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
  updateGroupParams,
  updateGroupSchema,
} from "@/lib/db/schema/groups";
import { createUserGroupAction, deleteUserGroupAction } from "./associative";
import { getUserAuth } from "../auth/utils";

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

export const createGroupAction = async (
  input: NewGroupParams,
  users?: string[]
) => {
  try {
    const { session } = await getUserAuth();
    const payload = insertGroupParams.parse(input);
    const result = await createGroup(payload);
    // Create associtive users
    console.log(users);
    if (users) {
      users.map(async (user) => {
        await createUserGroupAction({
          user_id: session?.user.id!,
          user_email: user,
          group_id: result.group.id,
        });
      });
    }
    revalidateGroups();
  } catch (e) {
    return handleErrors(e);
  }
};

export const updateGroupAction = async (
  input: UpdateGroupParams,
  users?: string[],
  user_emails?: string[] // Original users
) => {
  try {
    const { session } = await getUserAuth();
    const payload = updateGroupParams.parse(input);
    await updateGroup(payload.id, payload);
    // Update associtive users
    // Removed users (user_emails - users)
    const removedUsers = user_emails?.filter((x) => !users?.includes(x));
    // Added users (users - user_emails)
    const addedUsers = users?.filter((x) => !user_emails?.includes(x));
    // Update
    if (removedUsers) {
      removedUsers.map(async (user_email) => {
        await deleteUserGroupAction({
          user_email: user_email,
          group_id: input.id,
        });
      });
    }
    if (addedUsers) {
      addedUsers.map(async (user_email) => {
        await createUserGroupAction({
          user_id: session?.user.id!,
          user_email: user_email,
          group_id: input.id,
        });
      });
    }
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
