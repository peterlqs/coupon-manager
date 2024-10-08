import { db } from "@/lib/db/index";
import { eq, and, lt, gte, SQLWrapper, gt } from "drizzle-orm";
import { getUserAuth } from "@/lib/auth/utils";
import { coupons } from "@/lib/db/schema/coupons";
import { coupon_groups, user_groups } from "@/lib/db/schema/associative";
import { users } from "@/lib/db/schema/users";

export const getCoupons = async () => {
  const { session } = await getUserAuth();
  const rows = await db
    .select({ coupons })
    .from(users)
    .where(eq(users.email, session?.user.email || ""))
    .innerJoin(user_groups, eq(users.email, user_groups.user_email))
    .innerJoin(coupon_groups, eq(user_groups.group_id, coupon_groups.group_id))
    .innerJoin(coupons, eq(coupon_groups.coupon_id, coupons.id));
  const f = rows.map((item) => item.coupons);
  return { coupons: f };
};

export const getCouponById = async (id: string) => {
  const { session } = await getUserAuth();
  const rows = await db
    .select()
    .from(coupons)
    .where(and(eq(coupons.id, id), eq(coupons.userId, session?.user.id!)));

  return { coupon: rows[0] };
};

// Get coupons that has expiration date less than {days} day from today
export const getAllCouponsByDays = async (days: number) => {
  const today = new Date();
  const remindDate = new Date(today);
  const aDayBeforeRemindDate = new Date(today);
  remindDate.setDate(today.getDate() + days);
  aDayBeforeRemindDate.setDate(today.getDate() + days - 1);

  const rows = await db
    .select()
    .from(coupons)
    .where(
      and(
        gte(coupons.expiration_date, today),
        gt(coupons.expiration_date, aDayBeforeRemindDate),
        lt(coupons.expiration_date, remindDate),
        eq(coupons.used, false)
      )
    );
  const f = rows;
  return { coupons: f };
};

// Get the all the user emails that have coupons that expire in 1 day
export const getAllDayCouponsUsers = async (id: string) => {
  const rows = await db
    .selectDistinct({
      user_email: user_groups.user_email,
    })
    .from(user_groups)
    .innerJoin(coupon_groups, eq(user_groups.group_id, coupon_groups.group_id))
    .innerJoin(coupons, eq(coupon_groups.coupon_id, coupons.id))
    .where(and(eq(coupons.id, coupon_groups.coupon_id), eq(coupons.id, id)));

  const f = rows;
  return { user_groups: f };
};
