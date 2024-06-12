import { Suspense, useState } from "react";
import { notFound } from "next/navigation";

import { getGroupByIdWithCoupons, getGroups } from "@/lib/api/groups/queries";
import { checkAuth } from "@/lib/auth/utils";
import ModelList from "@/components/models/ModelList";

import { BackButton } from "@/components/shared/BackButton";
import Loading from "@/app/loading";
import GroupsList from "@/components/groups/GroupsList";
import CouponsList from "@/components/coupons/CouponsList";
import { Coupon } from "@/lib/db/schema/coupons";
import { getUserGroup } from "@/lib/api/associative/queries";
import Modal from "@/components/shared/Modal";
import GroupForm from "@/components/groups/GroupForm";
import { Button } from "@/components/ui/button";
import GroupTop from "./GroupTop";

export const revalidate = 0;

export default async function GroupPage({
  params,
}: {
  params: { groupId: string };
}) {
  return (
    <main className="overflow-auto">
      <Group id={params.groupId} />
    </main>
  );
}

const Group = async ({ id }: { id: string }) => {
  await checkAuth();
  const { groups } = await getGroups();
  const group = groups.find((group) => group.id === id);
  if (!group) notFound();
  const { coupons } = await getGroupByIdWithCoupons(id);
  // Get group's user's emails
  const { user_groups } = await getUserGroup(id);
  // remove duplicates
  const users = [...new Set(user_groups.map((item) => item))];
  // join
  const usersEmail = users.map((user) => user.user_email);

  return (
    <Suspense fallback={<Loading />}>
      <div className="relative">
        <BackButton currentResource="groups" />
        <div className="p-4 pb-8 mt-4 rounded-lg border border-secondary">
          <GroupTop group={group} user_groups={user_groups} />
          <div className="mx-4 flex gap-2 items-center flex-wrap">
            <p>Members: </p>
            {usersEmail.map((user) => (
              <p className="bg-secondary rounded-lg px-2 py-1" key={user}>
                {user}
              </p>
            ))}
          </div>
        </div>
      </div>

      <div className="relative mt-8 mx-4">
        <h3 className="text-xl font-medium mb-4">Coupons</h3>
        <CouponsList coupons={coupons} groups={groups} groupsId={group.id} />
      </div>
    </Suspense>
  );
};
