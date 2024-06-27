"use client";

import { useOptimistic, useState } from "react";
import { TAddOptimistic } from "@/app/(app)/coupons/useOptimisticCoupons";
import { type Coupon } from "@/lib/db/schema/coupons";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import Modal from "@/components/shared/Modal";
import CouponForm from "@/components/coupons/CouponForm";
import { type Group, type GroupId } from "@/lib/db/schema/groups";

export default function OptimisticCoupon({ 
  coupon,
  groups,
  groupId 
}: { 
  coupon: Coupon; 
  
  groups: Group[];
  groupId?: GroupId
}) {
  const [open, setOpen] = useState(false);
  const openModal = (_?: Coupon) => {
    setOpen(true);
  };
  const closeModal = () => setOpen(false);
  const [optimisticCoupon, setOptimisticCoupon] = useOptimistic(coupon);
  const updateCoupon: TAddOptimistic = (input) =>
    setOptimisticCoupon({ ...input.data });

  return (
    <div className="m-4">
      <Modal open={open} setOpen={setOpen}>
        <CouponForm
          coupon={optimisticCoupon}
          groups={groups}
        groupId={groupId}
          closeModal={closeModal}
          openModal={openModal}
          addOptimistic={updateCoupon}
        />
      </Modal>
      <div className="flex justify-between items-end mb-4">
        <h1 className="font-semibold text-2xl">{optimisticCoupon.code}</h1>
        <Button className="" onClick={() => setOpen(true)}>
          Edit
        </Button>
      </div>
      <pre
        className={cn(
          "bg-secondary p-4 rounded-lg break-all text-wrap",
          optimisticCoupon.id === "optimistic" ? "animate-pulse" : "",
        )}
      >
        {JSON.stringify(optimisticCoupon, null, 2)}
      </pre>
    </div>
  );
}
