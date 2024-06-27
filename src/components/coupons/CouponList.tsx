"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { type Coupon, CompleteCoupon } from "@/lib/db/schema/coupons";
import Modal from "@/components/shared/Modal";
import { type Group, type GroupId } from "@/lib/db/schema/groups";
import { useOptimisticCoupons } from "@/app/(app)/coupons/useOptimisticCoupons";
import { Button } from "@/components/ui/button";
import CouponForm from "./CouponForm";
import { PlusIcon } from "lucide-react";
import CouponsForm from "./CouponsForm";

type TOpenModal = (coupon?: Coupon) => void;

export default function CouponList({
  coupons,
  groups,
  groupId,
}: {
  coupons: CompleteCoupon[];
  groups: Group[];
  groupId?: GroupId;
}) {
  const { optimisticCoupons, addOptimisticCoupon } = useOptimisticCoupons(
    coupons,
    groups
  );
  const [open, setOpen] = useState(false);
  const [activeCoupon, setActiveCoupon] = useState<Coupon | null>(null);
  const openModal = (coupon?: Coupon) => {
    setOpen(true);
    coupon ? setActiveCoupon(coupon) : setActiveCoupon(null);
  };
  const closeModal = () => setOpen(false);

  return (
    <div>
      <Modal
        open={open}
        setOpen={setOpen}
        title={activeCoupon ? "Edit Coupon" : "Create Coupon"}
      >
        <CouponsForm
          coupon={activeCoupon}
          addOptimistic={addOptimisticCoupon}
          openModal={openModal}
          closeModal={closeModal}
          groups={groups}
          groupId={groupId}
        />
      </Modal>
      <div className="absolute right-0 top-0 ">
        <Button onClick={() => openModal()} variant={"outline"}>
          +
        </Button>
      </div>
      {optimisticCoupons.length === 0 ? (
        <EmptyState openModal={openModal} />
      ) : (
        <ul>
          {optimisticCoupons.map((coupon) => (
            <Coupon coupon={coupon} key={coupon.id} openModal={openModal} />
          ))}
        </ul>
      )}
    </div>
  );
}

const Coupon = ({
  coupon,
  openModal,
}: {
  coupon: CompleteCoupon;
  openModal: TOpenModal;
}) => {
  const optimistic = coupon.id === "optimistic";
  const deleting = coupon.id === "delete";
  const mutating = optimistic || deleting;
  const pathname = usePathname();
  const basePath = pathname.includes("coupons")
    ? pathname
    : pathname + "/coupons/";

  return (
    <li
      className={cn(
        "flex justify-between my-2",
        mutating ? "opacity-30 animate-pulse" : "",
        deleting ? "text-destructive" : ""
      )}
    >
      <div className="w-full">
        <div>{coupon.code}</div>
      </div>
      <Button variant={"link"} asChild>
        <Link href={basePath + "/" + coupon.id}>Edit</Link>
      </Button>
    </li>
  );
};

const EmptyState = ({ openModal }: { openModal: TOpenModal }) => {
  return (
    <div className="text-center">
      <h3 className="mt-2 text-sm font-semibold text-secondary-foreground">
        No coupons
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Get started by creating a new coupon.
      </p>
      <div className="mt-6">
        <Button onClick={() => openModal()}>
          <PlusIcon className="h-4" /> New Coupons{" "}
        </Button>
      </div>
    </div>
  );
};
