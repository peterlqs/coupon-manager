"use client";

import { use, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import Modal from "@/components/shared/Modal";

import { Button } from "@/components/ui/button";
import {
  CameraIcon,
  CheckIcon,
  EditIcon,
  PencilIcon,
  PlusIcon,
} from "lucide-react";
import { Coupon } from "@/lib/db/schema/coupons";
import CouponForm from "./CouponsForm";
import { Group, GroupId } from "@/lib/db/schema/groups";
import { z } from "zod";
import { Input } from "../ui/input";
import ImageInput from "./ImageInput";
import { updateCouponAction } from "@/lib/actions/coupons";
import { set } from "date-fns";

type TOpenModal = () => void;

export const schema = z.object({
  resume: z.instanceof(File).refine((file) => file.size < 7000000, {
    message: "Your resume must be less than 7MB.",
  }),
});

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

  // Sort the coupons by expiration_date
  coupons.sort((a, b) => {
    if (a.expiration_date && b.expiration_date) {
      return (
        new Date(a.expiration_date).getTime() -
        new Date(b.expiration_date).getTime()
      );
    }
    return 0;
  });

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
      <div className="absolute right-0 top-0 gap-2 flex">
        <Button onClick={openModal} variant={"default"} size={"default"}>
          <PlusIcon className="h-4" />
          Add
        </Button>
      </div>
      {coupons.length === 0 ? (
        <EmptyState openModal={openModal} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
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
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const openModal = (_?: Coupon) => {
    setOpen(true);
  };
  const closeModal = () => setOpen(false);

  const formattedDate = coupon.expiration_date
    ? new Date(coupon.expiration_date).toLocaleDateString()
    : "";
  const date1 = new Date(formattedDate);
  const date2 = new Date();
  date1.setHours(0, 0, 0, 0);
  date2.setHours(0, 0, 0, 0);
  // Calculate difference in days
  const daysLeft = Math.floor(
    (date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24)
  );
  const group = groups.find((group) => group.id === coupon.group);
  console.log(coupon.store);

  const formattedDiscountAmount = coupon.discount_amount?.toLocaleString(
    "vi-VN",
    {
      // style: "currency",
      currency: "VND",
    }
  );

  const usedCoupon = async () => {
    setIsLoading(true);
    await updateCouponAction({ ...coupon, used: true });
    setIsLoading(false);
  };

  return (
    <div className="flex justify-between items-start py-4 px-4 rounded-lg border border-slate-300 dark:border-slate-700">
      <div>
        {coupon.discount_amount && coupon.discount_amount > 0 && (
          <p className="text-md text-4xl font-semibold flex items-start mb-1">
            {formattedDiscountAmount}
            <span className="text-xl ml-1">₫</span>
          </p>
        )}
        <p className="text-sm text-muted-foreground">Code</p>
        <p className="text-lg">{coupon.code}</p>
        <p className="text-sm text-muted-foreground">Date</p>
        <p className="text-lg">
          {formattedDate}{" "}
          <span className="text-muted-foreground text-sm">
            {daysLeft != 0 ? `${daysLeft} days left` : "Expire today"}
          </span>
        </p>
        {coupon.store && (
          <div>
            <p className="text-sm text-muted-foreground">Store</p>
            <p className="text-lg">{coupon.store}</p>
          </div>
        )}
        {group && (
          <div>
            <p className="text-sm text-muted-foreground">Group</p>
            <p className="text-lg">{group.name}</p>
          </div>
        )}
      </div>
      <Modal open={open} setOpen={setOpen}>
        <CouponForm
          groups={groups}
          coupon={coupon}
          closeModal={closeModal}
          openModal={openModal}
        />
      </Modal>
      <div className="flex flex-col justify-between gap-2 items-center h-full">
        <Button
          variant={"outline"}
          size={"icon"}
          className=""
          disabled={isLoading}
          onClick={usedCoupon}
        >
          <CheckIcon className="h-4" />
        </Button>
        <Button variant={"link"} className="" onClick={() => setOpen(true)}>
          Edit
        </Button>
      </div>
    </div>
  );
};

const EmptyState = ({ openModal }: { openModal: TOpenModal }) => {
  return (
    <div className="text-center">
      <h3 className="mt-8 text-sm font-semibold text-secondary-foreground">
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
