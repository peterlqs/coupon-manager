import { getUserAuth } from "@/lib/auth/utils";
import { db } from "@/lib/db";
import { insertUserSchema, users } from "@/lib/db/schema/users";

export const createUser = async () => {
  const { session } = await getUserAuth();
  const newUser = insertUserSchema.parse({
    email: session?.user.email!,
    name: session?.user.name!,
    id: session?.user.id!,
  });

  try {
    const [u] = await db.insert(users).values(newUser).returning();
    return { user: u };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};
