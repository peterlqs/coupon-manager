import { db } from "@/lib/db/index";
import { and, eq } from "drizzle-orm";
import {
  GroupId,
  NewGroupParams,
  UpdateGroupParams,
  updateGroupSchema,
  insertGroupSchema,
  groups,
  groupIdSchema,
} from "@/lib/db/schema/groups";
import { getUserAuth } from "@/lib/auth/utils";
import { user_groups } from "@/lib/db/schema/associative";

export const createGroup = async (group: NewGroupParams) => {
  const { session } = await getUserAuth();
  const newGroup = insertGroupSchema.parse({
    ...group,
    userId: session?.user.id!,
  });

  try {
    const [g] = await db.insert(groups).values(newGroup).returning();
    // Add to association table
    await db
      .insert(user_groups)
      .values({
        group_id: g.id,
        user_id: session?.user.id!,
        user_email: session?.user.email!,
      })
      .returning();

    return { group: g };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

export const updateGroup = async (id: GroupId, group: UpdateGroupParams) => {
  const { session } = await getUserAuth();
  const { id: groupId } = groupIdSchema.parse({ id });
  const newGroup = updateGroupSchema.parse({
    ...group,
    userId: session?.user.id!,
  });
  try {
    const [g] = await db
      .update(groups)
      .set({ ...newGroup, updatedAt: new Date() })
      .where(and(eq(groups.id, groupId!), eq(groups.userId, session?.user.id!)))
      .returning();
    return { group: g };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

export const deleteGroup = async (id: GroupId) => {
  const { session } = await getUserAuth();
  const { id: groupId } = groupIdSchema.parse({ id });
  try {
    // delete in association table
    await db
      .delete(user_groups)
      .where(
        and(
          eq(user_groups.group_id, groupId!),
          eq(user_groups.user_id, session?.user.id!)
        )
      )
      .returning();

    const [g] = await db
      .delete(groups)
      .where(and(eq(groups.id, groupId!), eq(groups.userId, session?.user.id!)))
      .returning();
    return { group: g };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};
