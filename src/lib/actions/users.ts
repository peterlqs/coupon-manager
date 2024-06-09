"use server";

import { createUser } from "../api/users/mutation";

const handleErrors = (e: unknown) => {
  const errMsg = "Error, please try again.";
  if (e instanceof Error) return e.message.length > 0 ? e.message : errMsg;
  if (e && typeof e === "object" && "error" in e) {
    const errAsStr = e.error as string;
    return errAsStr.length > 0 ? errAsStr : errMsg;
  }
  return errMsg;
};

// const revalidateModels = () => revalidatePath("/models");

export const createUserAction = async () => {
  try {
    await createUser();
    // revalidateModels();
  } catch (e) {
    return handleErrors(e);
  }
};
