"use server";

import { revalidatePath } from "next/cache";
import {
  createUserGroup,
  //   deleteUserGroup,
  //   updateUserGroup,
} from "@/lib/api/associative/mutation";
import {
  //   UserGroupId,
  NewUserGroupParams,
  //   UpdateUserGroupParams,
  userGroupIdSchema,
  insertUserGroupParams,
  insertUserGroupSchema,
  //   updateUserGroupSchema,
} from "@/lib/db/schema/associative";

const handleErrors = (e: unknown) => {
  const errMsg = "Error, please try again.";
  if (e instanceof Error) return e.message.length > 0 ? e.message : errMsg;
  if (e && typeof e === "object" && "error" in e) {
    const errAsStr = e.error as string;
    return errAsStr.length > 0 ? errAsStr : errMsg;
  }
  return errMsg;
};

// const revalidateUserGroups = () => revalidatePath("/userGroups");

export const createUserGroupAction = async (input: NewUserGroupParams) => {
  try {
    const payload = insertUserGroupParams.parse(input);
    await createUserGroup(payload);
    // revalidateUserGroups();
  } catch (e) {
    return handleErrors(e);
  }
};

// export const updateUserGroupAction = async (input: UpdateUserGroupParams) => {
//   try {
//     const payload = updateUserGroupSchema.parse(input);
//     await updateUserGroup(payload.id, payload);
//     revalidateUserGroups();
//   } catch (e) {
//     return handleErrors(e);
//   }
// };

// export const deleteUserGroupAction = async (input: UserGroupId) => {
//   try {
//     const payload = userGroupIdSchema.parse({ id: input });
//     await deleteUserGroup(payload.id);
//     revalidateUserGroups();
//   } catch (e) {
//     return handleErrors(e);
//   }
// };
