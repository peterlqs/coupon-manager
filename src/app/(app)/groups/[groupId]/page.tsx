import { Suspense } from "react";
import { notFound } from "next/navigation";

import { getGroupByIdWithCoupons } from "@/lib/api/groups/queries";
import { checkAuth } from "@/lib/auth/utils";
import ModelList from "@/components/models/ModelList";

import { BackButton } from "@/components/shared/BackButton";
import Loading from "@/app/loading";
import GroupsList from "@/components/groups/GroupsList";
import CouponsList from "@/components/coupons/CouponsList";

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
  console.log(id);
  const { coupons, group } = await getGroupByIdWithCoupons(id);

  if (!group) notFound();
  return (
    <Suspense fallback={<Loading />}>
      <div className="relative">
        <BackButton currentResource="groups" />
      </div>
      <div className="relative mt-8 mx-4">
        <h3 className="text-xl font-medium mb-4">
          {group.name}&apos;s Coupons
        </h3>
        <CouponsList coupons={coupons} groups={[]} groupsId={group.id} />
      </div>
    </Suspense>
  );
};
