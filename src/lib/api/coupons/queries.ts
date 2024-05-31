import { db } from "@/lib/db/index";
import { eq, and, lt, gte, SQLWrapper } from "drizzle-orm";
import { getUserAuth } from "@/lib/auth/utils";
import { coupons } from "@/lib/db/schema/coupons";
import { coupon_groups, user_groups } from "@/lib/db/schema/associative";

export const getCoupons = async () => {
  const { session } = await getUserAuth();
  const rows = await db
    .select()
    .from(coupons)
    .where(eq(coupons.userId, session?.user.id!));
  const f = rows;
  return { coupons: f };
};

// Get coupons that has expiration date less than 1 day from today
export const getAll1DayCoupons = async () => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const rows = await db
    // .selectDistinct({
    //   user_email: user_groups.user_email,
    // })
    .select()
    .from(coupons)
    .where(
      and(
        gte(coupons.expiration_date, today),
        lt(coupons.expiration_date, tomorrow)
        // Join coupon_group table
        // eq(coupons.id, coupon_groups.coupon_id)
      )
    );
  // .innerJoin(coupon_groups, eq(coupons.id, coupon_groups.coupon_id))
  // .innerJoin(user_groups, eq(coupon_groups.group_id, user_groups.group_id));

  const f = rows;
  return { coupons: f };
};

// Get the all the user emails that have coupons that expire in 1 day
export const getAll1DayCouponsUsers = async (id: string) => {
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
