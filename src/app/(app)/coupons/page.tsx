import { Suspense } from "react";

import Loading from "@/app/loading";
import FurnitureList from "@/components/furnitures/FurnitureList";
import { getFurnitures } from "@/lib/api/furnitures/queries";

import { checkAuth } from "@/lib/auth/utils";
import { getCoupons } from "@/lib/api/coupons/queries";
import CouponsList from "@/components/coupons/CouponsList";
import { getGroups } from "@/lib/api/groups/queries";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getUser } from "@/lib/api/users/queries";
import { createGroupAction } from "@/lib/actions/groups";
import { createUserAction } from "@/lib/actions/users";
import { Group } from "@/lib/db/schema/groups";

export const revalidate = 0;

export default async function CouponsPage() {
  // Check if user is added in Supabase yet
  const user = await getUser();

  if (!user.user[0]) {
    await createUserAction();
    const pendingGroup: Group = {
      name: "Default",
      description: "This group is created by default",
      createdAt: new Date(),
      updatedAt: new Date(),
      id: "",
      userId: "",
    };
    await createGroupAction(pendingGroup);
  }

  return (
    <main>
      <div className="relative">
        <div className="">
          <h1 className="font-semibold text-2xl my-2">Coupons</h1>
          <p className="mt-4 md:mt-0">
            A reminder email will be sent a week and a day before a coupon
            expires.
          </p>
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
    if (coupon.expiration_date && coupon.used === false) {
      const expirationDate = new Date(coupon.expiration_date);
      const currentDate = new Date();
      expirationDate.setHours(0, 0, 0, 0);
      currentDate.setHours(0, 0, 0, 0);
      return expirationDate.getTime() < currentDate.getTime();
    }
    return false;
  });
  const activeCoupons = coupons.filter((coupon) => {
    if (coupon.expiration_date && coupon.used === false) {
      const expirationDate = new Date(coupon.expiration_date);
      const currentDate = new Date();
      expirationDate.setHours(0, 0, 0, 0);
      currentDate.setHours(0, 0, 0, 0);
      return expirationDate.getTime() >= currentDate.getTime();
    }
    return false;
  });
  const usedCoupons = coupons.filter((coupon) => coupon.used === true);

  return (
    <Suspense fallback={<Loading />}>
      {/* <FurnitureList furnitures={furnitures}  /> */}
      {/* <CouponsList coupons={coupons} groups={groups} /> */}
      <Tabs defaultValue="active" className="mt-4">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-3">
          {/* <TabsList className="flex gap-4 flex-wrap"> */}
          <TabsTrigger value="active">Active Coupons</TabsTrigger>
          <TabsTrigger value="expired">Expired Coupons</TabsTrigger>
          <TabsTrigger value="used">Used Coupons</TabsTrigger>
        </TabsList>
        <TabsContent value="active">
          <CouponsList coupons={activeCoupons} groups={groups} />
        </TabsContent>
        <TabsContent value="expired">
          <CouponsList coupons={expiredCoupons} groups={groups} />
        </TabsContent>
        <TabsContent value="used">
          <CouponsList coupons={usedCoupons} groups={groups} />
        </TabsContent>
      </Tabs>
    </Suspense>
  );
};
