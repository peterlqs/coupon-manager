import { Suspense } from "react";

import Loading from "@/app/loading";
import FurnitureList from "@/components/furnitures/FurnitureList";
import { getFurnitures } from "@/lib/api/furnitures/queries";

import { checkAuth } from "@/lib/auth/utils";
import { getCoupons } from "@/lib/api/coupons/queries";
import CouponsList from "@/components/coupons/CouponsList";
import { getGroups } from "@/lib/api/groups/queries";

export const revalidate = 0;

export default async function CouponsPage() {
  return (
    <main>
      <div className="relative">
        <div className="flex justify-between">
          <h1 className="font-semibold text-2xl my-2">Coupons</h1>
        </div>
        <Coupons />
      </div>
    </main>
  );
}

const Coupons = async () => {
  await checkAuth();

  const { coupons } = await getCoupons();
  const { groups } = await getGroups();

  return (
    <Suspense fallback={<Loading />}>
      {/* <FurnitureList furnitures={furnitures}  /> */}
      <CouponsList coupons={coupons} groups={groups} />
    </Suspense>
  );
};
