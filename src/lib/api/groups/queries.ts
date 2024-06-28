import { db } from "@/lib/db/index";
import { eq, and, inArray } from "drizzle-orm";
import { getUserAuth } from "@/lib/auth/utils";
import { groupIdSchema, groups } from "@/lib/db/schema/groups";
import { CompleteCoupon, coupons } from "@/lib/db/schema/coupons";
import { coupon_groups, user_groups } from "@/lib/db/schema/associative";

export const getGroups = async () => {
  const { session } = await getUserAuth();

  const rows = await db
    .select()
    .from(groups)
    .innerJoin(
      user_groups,
      eq(user_groups.group_id, groups.id) // Join on the shared group_id column
    )
    .where(eq(user_groups.user_email, session?.user.email || "")) // Filter for specific user
    .leftJoin(coupon_groups, eq(groups.id, coupon_groups.group_id));

  const f = rows;
  const allGroups = f
    .map((item) => item.groups)
    // Remove duplicates by id
    .filter(
      (item, index, self) => self.findIndex((t) => t.id === item.id) === index
    );
  const allCouponGroups = f.map((item) => item.coupon_groups);
  return { groups: allGroups, couponGroups: allCouponGroups };
};

export const getAllGroups = async () => {
  const rows = await db.select().from(groups);

  return { groups: rows };
};

export const getGroupById = async (id: string) => {
  const { session } = await getUserAuth();
  const rows = await db
    .select()
    .from(groups)
    .where(and(eq(groups.id, id), eq(groups.userId, session?.user.id!)));

  return { group: rows[0] };
};

export const getGroupByIdWithCoupons = async (id: string) => {
  const { session } = await getUserAuth();
  const { id: groupId } = groupIdSchema.parse({ id });

  const rows = await db
    .select()
    .from(groups)
    .innerJoin(user_groups, eq(user_groups.group_id, groups.id))
    .where(
      and(
        eq(user_groups.user_email, session?.user.email || ""),
        eq(groups.id, groupId)
      )
    )
    // .leftJoin(coupon_groups, eq(groups.id, coupon_groups.group_id))
    // .leftJoin(coupons, eq(coupons.groupId, coupon_groups.group_id));
    .leftJoin(coupons, eq(coupons.groupId, groups.id));

  // console.log("---------\n", rows);
  if (rows.length === 0) return {};
  const f = rows[0].groups;
  const fm = rows
    .filter((item) => item.coupons !== null)
    .map((item) => item.coupons) as CompleteCoupon[];
  return { coupons: fm, group: f };
};
