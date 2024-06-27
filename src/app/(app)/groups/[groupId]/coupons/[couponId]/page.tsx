import { Suspense } from "react";
import { notFound } from "next/navigation";

import { getCouponById } from "@/lib/api/coupons/queries";
import { getGroups } from "@/lib/api/groups/queries";
import OptimisticCoupon from "@/app/(app)/coupons/[couponId]/OptimisticCoupon";

import { BackButton } from "@/components/shared/BackButton";
import Loading from "@/app/loading";
import React from "react";

export const revalidate = 0;

export default async function CouponPage({
  params,
}: {
  params: { couponId: string };
}) {
  return (
    <main className="overflow-auto">
      <Coupon id={params.couponId} />
    </main>
  );
}

const Coupon = async ({ id }: { id: string }) => {
  const { coupon } = await getCouponById(id);
  const { groups } = await getGroups();

  if (!coupon) notFound();
  return (
    <Suspense fallback={<Loading />}>
      <div className="relative">
        <BackButton currentResource="coupons" />
        <OptimisticCoupon
          coupon={coupon}
          groups={groups}
          groupId={coupon.groupId}
        />
      </div>
    </Suspense>
  );
};
