import { db } from "@/lib/db/index";
import { eq, and } from "drizzle-orm";
import { getUserAuth } from "@/lib/auth/utils";
import { coupons } from "@/lib/db/schema/coupons";

export const getCoupons = async () => {
  const { session } = await getUserAuth();
  const rows = await db
    .select()
    .from(coupons)
    .where(eq(coupons.userId, session?.user.id!));
  const f = rows;
  return { coupons: f };
};
