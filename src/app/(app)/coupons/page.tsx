import { Suspense } from "react";

import Loading from "@/app/loading";
import FurnitureList from "@/components/furnitures/FurnitureList";
import { getFurnitures } from "@/lib/api/furnitures/queries";

import { checkAuth } from "@/lib/auth/utils";
import { getCoupons } from "@/lib/api/coupons/queries";
import CouponsList from "@/components/coupons/CouponsList";
import { getGroups } from "@/lib/api/groups/queries";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

  // Separate coupons to expired ones and active ones based on expiration_date
  const expiredCoupons = coupons.filter((coupon) => {
    if (coupon.expiration_date) {
      const expirationDate = new Date(coupon.expiration_date);
      const currentDate = new Date();
      expirationDate.setHours(0, 0, 0, 0);
      currentDate.setHours(0, 0, 0, 0);
      return expirationDate.getTime() < currentDate.getTime();
    }
    return false;
  });
  const activeCoupons = coupons.filter((coupon) => {
    if (coupon.expiration_date) {
      const expirationDate = new Date(coupon.expiration_date);
      const currentDate = new Date();
      expirationDate.setHours(0, 0, 0, 0);
      currentDate.setHours(0, 0, 0, 0);
      return expirationDate.getTime() >= currentDate.getTime();
    }
    return false;
  });

  return (
    <Suspense fallback={<Loading />}>
      {/* <FurnitureList furnitures={furnitures}  /> */}
      {/* <CouponsList coupons={coupons} groups={groups} /> */}
      <Tabs defaultValue="active" className="mt-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">Active Coupons</TabsTrigger>
          <TabsTrigger value="expired">Expired Coupons</TabsTrigger>
        </TabsList>
        <TabsContent value="active">
          <CouponsList coupons={activeCoupons} groups={groups} />
        </TabsContent>
        <TabsContent value="expired">
          <CouponsList coupons={expiredCoupons} groups={groups} />
        </TabsContent>
      </Tabs>
    </Suspense>
  );
};
