import { Suspense } from "react";
import { notFound } from "next/navigation";

import { getGroupByIdWithCoupons } from "@/lib/api/groups/queries";
import OptimisticGroup from "./OptimisticGroup";
import CouponList from "@/components/coupons/CouponList";

import { BackButton } from "@/components/shared/BackButton";
import Loading from "@/app/loading";
import CouponsList from "@/components/coupons/CouponsList";
import { Coupons } from "../../coupons/page";
import { getUserGroup } from "@/lib/api/associative/queries";
import { getUserAuth } from "@/lib/auth/utils";

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
  const { group, coupons } = await getGroupByIdWithCoupons(id);
  const { session } = await getUserAuth();
  // Get group's user's emails
  const { user_groups } = await getUserGroup(id);
  const users = [...new Set(user_groups.map((item) => item))];
  const usersEmail = users
    .map((user) => user.user_email || "")
    .filter((email) => email !== session?.user.email);

  if (!group) notFound();
  return (
    <Suspense fallback={<Loading />}>
      <div className="relative">
        <BackButton currentResource="groups" />
        {/* <GroupTop group={group} user_groups={user_groups} /> */}
        <OptimisticGroup group={group} users_email={usersEmail} />
      </div>
      <div className="relative mt-8 mx-4">
        <h3 className="text-xl font-medium mb-4">
          {group.name}&apos;s Coupons
        </h3>
        <p className="mt-4 md:mt-0">
          A reminder email will be sent a week and a day before a coupon
          expires.
        </p>
        {/* <CouponsList groups={[]} groupId={group.id} coupons={coupons} /> */}
        <Coupons coupons={coupons} groups={[group]} />
      </div>
    </Suspense>
  );
};
