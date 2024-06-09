import { db } from "@/lib/db/index";
import { eq } from "drizzle-orm";
import { getUserAuth } from "@/lib/auth/utils";
import { users } from "@/lib/db/schema/users";

export const getUser = async () => {
  const { session } = await getUserAuth();
  const rows = await db
    .select()
    .from(users)
    .where(eq(users.id, session?.user.id!));
  const f = rows;
  return { user: f };
};
