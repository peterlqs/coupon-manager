"use server";

import { revalidatePath } from "next/cache";
import {
  createCoupon,
  deleteCoupon,
  updateCoupon,
} from "@/lib/api/coupons/mutation";
import {
  CouponId,
  NewCouponParams,
  UpdateCouponParams,
  couponIdSchema,
  insertCouponParams,
  insertCouponSchema,
  updateCouponSchema,
} from "@/lib/db/schema/coupons";

const handleErrors = (e: unknown) => {
  const errMsg = "Error, please try again.";
  if (e instanceof Error) return e.message.length > 0 ? e.message : errMsg;
  if (e && typeof e === "object" && "error" in e) {
    const errAsStr = e.error as string;
    return errAsStr.length > 0 ? errAsStr : errMsg;
  }
  return errMsg;
};

const revalidateCoupons = () => revalidatePath("/coupons");

export const createCouponAction = async (input: NewCouponParams) => {
  try {
    const payload = insertCouponParams.parse(input);
    await createCoupon(payload);
    revalidateCoupons();
  } catch (e) {
    return handleErrors(e);
  }
};

export const updateCouponAction = async (input: UpdateCouponParams) => {
  try {
    const payload = updateCouponSchema.parse(input);
    await updateCoupon(payload.id, payload);
    revalidateCoupons();
  } catch (e) {
    return handleErrors(e);
  }
};

export const deleteCouponAction = async (input: CouponId) => {
  try {
    const payload = couponIdSchema.parse({ id: input });
    await deleteCoupon(payload.id);
    revalidateCoupons();
  } catch (e) {
    return handleErrors(e);
  }
};
