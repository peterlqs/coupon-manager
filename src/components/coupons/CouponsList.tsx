"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import Modal from "@/components/shared/Modal";

import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { Coupon } from "@/lib/db/schema/coupons";
import CouponForm from "./CouponsForm";
import { Group, GroupId } from "@/lib/db/schema/groups";

type TOpenModal = () => void;

export default function CouponsList({
  coupons,
  groups,
  groupsId,
}: {
  coupons: Coupon[];
  groups: Group[];
  groupsId?: GroupId;
}) {
  const [open, setOpen] = useState(false);
  const [activeCoupon, setActiveCoupon] = useState<Coupon | null>(null);
  const openModal = () => setOpen(true);
  const closeModal = () => setOpen(false);

  return (
    <div>
      <Modal open={open} setOpen={setOpen} title={"Create Coupon"}>
        <CouponForm
          groups={groups}
          groupsId={groupsId}
          coupon={activeCoupon}
          openModal={openModal}
          closeModal={closeModal}
        />
      </Modal>
      <div className="absolute right-0 top-0 ">
        <Button onClick={openModal} variant={"outline"}>
          <PlusIcon />
        </Button>
      </div>
      {coupons.length === 0 ? (
        <EmptyState openModal={openModal} />
      ) : (
        <div>
          {coupons.map((coupon) => (
            <CouponItem key={coupon.id} coupon={coupon} groups={groups} />
          ))}
        </div>
      )}
    </div>
  );
}

const CouponItem = ({
  coupon,
  groups,
}: {
  coupon: Coupon;
  groups: Group[];
}) => {
  const [open, setOpen] = useState(false);
  const openModal = (_?: Coupon) => {
    setOpen(true);
  };
  const closeModal = () => setOpen(false);
  return (
    <div className="flex justify-between items-center border-b border-border py-2">
      <div>
        <h3 className="font-semibold">Coupon code: {coupon.code}</h3>
        <p className="text-sm text-muted-foreground">
          {coupon.discount_amount}
        </p>
        <p className="text-sm text-muted-foreground">
          Group id: {coupon.group}
        </p>
        <p className="text-sm text-muted-foreground">Coupon ID: {coupon.id}</p>
      </div>
      <div>
        <Modal open={open} setOpen={setOpen}>
          <CouponForm
            groups={groups}
            coupon={coupon}
            closeModal={closeModal}
            openModal={openModal}
          />
        </Modal>
        <div>
          <Button variant={"link"} className="" onClick={() => setOpen(true)}>
            Edit
          </Button>
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ openModal }: { openModal: TOpenModal }) => {
  return (
    <div className="text-center">
      <h3 className="mt-2 text-sm font-semibold text-secondary-foreground">
        No coupons
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Get started by creating a new coupon
      </p>
      <div className="mt-6">
        <Button onClick={() => openModal()}>
          <PlusIcon className="h-4" /> New Coupon{" "}
        </Button>
      </div>
    </div>
  );
};
