import { Suspense } from "react";

import Loading from "@/app/loading";
import FurnitureList from "@/components/furnitures/FurnitureList";
import { getFurnitures } from "@/lib/api/furnitures/queries";

import { checkAuth } from "@/lib/auth/utils";
import { getCoupons } from "@/lib/api/coupons/queries";
import CouponsList from "@/components/coupons/CouponsList";
import { getGroups } from "@/lib/api/groups/queries";
import GroupsList from "@/components/groups/GroupsList";

export const revalidate = 0;

export default async function GroupsPage() {
  return (
    <main>
      <div className="relative">
        <div className="flex justify-between">
          <h1 className="font-semibold text-2xl my-2">Groups</h1>
        </div>
        <Groups />
      </div>
    </main>
  );
}

const Groups = async () => {
  await checkAuth();

  const { groups } = await getGroups();

  return (
    <Suspense fallback={<Loading />}>
      <GroupsList groups={groups} />
    </Suspense>
  );
};
