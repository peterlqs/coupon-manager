import { db } from "@/lib/db/index";
import { and, eq } from "drizzle-orm";
import {
  CouponId,
  NewCouponParams,
  UpdateCouponParams,
  updateCouponSchema,
  insertCouponSchema,
  coupons,
  couponIdSchema,
} from "@/lib/db/schema/coupons";
import { getUserAuth } from "@/lib/auth/utils";
import { coupon_groups } from "@/lib/db/schema/associative";

export const createCoupon = async (coupon: NewCouponParams) => {
  const { session } = await getUserAuth();
  const newCoupon = insertCouponSchema.parse({
    ...coupon,
    userId: session?.user.id!,
  });

  try {
    const [c] = await db.insert(coupons).values(newCoupon).returning();
    await db
      .insert(coupon_groups)
      .values({
        coupon_id: c.id,
        group_id: c.groupId,
      })
      .returning();

    return { coupon: c };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

export const updateCoupon = async (
  id: CouponId,
  coupon: UpdateCouponParams
) => {
  const { session } = await getUserAuth();
  const { id: couponId } = couponIdSchema.parse({ id });
  const newCoupon = updateCouponSchema.parse({
    ...coupon,
    userId: session?.user.id!,
  });
  try {
    const [c] = await db
      .update(coupons)
      .set({ ...newCoupon, updatedAt: new Date() })
      .where(
        and(eq(coupons.id, couponId!), eq(coupons.userId, session?.user.id!))
      )
      .returning();

    return { coupon: c };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

export const deleteCoupon = async (id: CouponId) => {
  const { session } = await getUserAuth();
  const { id: couponId } = couponIdSchema.parse({ id });
  try {
    // delete in associative table
    await db
      .delete(coupon_groups)
      .where(eq(coupon_groups.coupon_id, couponId!));

    const [c] = await db
      .delete(coupons)
      .where(
        and(eq(coupons.id, couponId!), eq(coupons.userId, session?.user.id!))
      )
      .returning();

    return { coupon: c };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};
