import { db } from "@/lib/db/index";
import { eq, and } from "drizzle-orm";
import { getUserAuth } from "@/lib/auth/utils";
import { groups } from "@/lib/db/schema/groups";
import { coupons } from "@/lib/db/schema/coupons";
import { coupon_groups, user_groups } from "@/lib/db/schema/associative";

export const getGroups = async () => {
  const { session } = await getUserAuth();

  const rows = await db
    .selectDistinct({
      id: groups.id,
      name: groups.name,
      description: groups.description,
      createdAt: groups.createdAt,
      updatedAt: groups.updatedAt,
      userId: groups.userId,
    })
    .from(groups)
    .innerJoin(
      user_groups,
      eq(user_groups.group_id, groups.id) // Join on the shared group_id column
    )
    .where(eq(user_groups.user_email, session?.user.email || "")); // Filter for specific user

  // .innerJoin(user_groups, eq(user_groups.group_id, groups.id))
  // .where(eq(user_groups.user_id, session?.user.id!));
  const f = rows;
  return { groups: f };
};

export const getGroupByIdWithCoupons = async (id: string) => {
  const { session } = await getUserAuth();
  const rows = await db
    .select()
    .from(groups)
    .innerJoin(coupon_groups, eq(groups.id, coupon_groups.group_id))
    .innerJoin(coupons, eq(coupons.id, coupon_groups.coupon_id))
    .where(eq(groups.id, id));

  // get all the coupons from f
  // const f = rows[0].groups!;
  // const fm = rows.map((item) => item.coupons !== null && item.coupons)

  const couponList = rows.map((item) => item.coupons);
  // get all the groups from f
  const groupList = rows.map((item) => item.groups);
  // return { coupons: couponList, group: groupList[0] };
  return { coupons: couponList };
};
