import { db } from "@/lib/db/index";
import { eq, and } from "drizzle-orm";
import { getUserAuth } from "@/lib/auth/utils";
import { coupons } from "@/lib/db/schema/coupons";
import { user_groups } from "@/lib/db/schema/associative";

// export const getCoupons = async () => {
//   const { session } = await getUserAuth();
//   const rows = await db
//     .select()
//     .from(coupons)
//     .where(eq(coupons.userId, session?.user.id!));
//   const f = rows;
//   return { coupons: f };
// };

export const getUserGroup = async (groupId: string) => {
  const { session } = await getUserAuth();
  const rows = await db
    .select()
    .from(user_groups)
    .where(eq(user_groups.group_id, groupId));
  const f = rows;
  return { user_groups: f };
};
