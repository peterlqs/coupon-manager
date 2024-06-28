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
  CopyIcon,
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
import CouponsForm from "./CouponsForm";
import { toast } from "sonner";
import { useOptimisticCoupons } from "@/app/(app)/coupons/useOptimisticCoupons";
import { useAuth } from "@clerk/nextjs";

type TOpenModal = () => void;

export const schema = z.object({
  resume: z.instanceof(File).refine((file) => file.size < 7000000, {
    message: "Your picture must be less than 7MB.",
  }),
});

export default function CouponsList({
  coupons,
  groups,
  groupId,
}: {
  coupons: Coupon[];
  groups: Group[];
  groupId?: GroupId;
}) {
  const { optimisticCoupons, addOptimisticCoupon } = useOptimisticCoupons(
    coupons,
    groups
  );
  const [open, setOpen] = useState(false);
  const [activeCoupon, setActiveCoupon] = useState<Coupon | null>(null);
  // const openModal = () => setOpen(true);
  const openModal = (coupon?: Coupon) => {
    setOpen(true);
    coupon ? setActiveCoupon(coupon) : setActiveCoupon(null);
  };
  const closeModal = () => setOpen(false);

  // Sort the coupons by expiration_date
  coupons.sort((a, b) => {
    if (a.expiration_date && b.expiration_date) {
      const expirationDateComparison =
        new Date(a.expiration_date).getTime() -
        new Date(b.expiration_date).getTime();
      if (expirationDateComparison !== 0) {
        return expirationDateComparison;
      }
    }
    if (a.createdAt && b.createdAt) {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return 0;
  });

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
      <div className="absolute right-0 top-0 gap-2 flex">
        <Button
          onClick={() => openModal()}
          variant={"default"}
          size={"default"}
        >
          <PlusIcon className="h-4" />
          Add
        </Button>
      </div>
      {optimisticCoupons.length === 0 ? (
        <EmptyState openModal={openModal} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          {optimisticCoupons.map((coupon) => (
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

  // Assuming coupon.expiration_date is in the format YYYY-MM-DD
  const formattedDate = coupon.expiration_date ? coupon.expiration_date : "";

  // Parse the expiration date using a standardized format
  const date1 = new Date(formattedDate);

  // Rest of the code remains the same

  const date2 = new Date();
  date1.setHours(0, 0, 0, 0);
  date2.setHours(0, 0, 0, 0);

  // Calculate difference in days
  const daysLeft = Math.floor(
    (date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24)
  );

  const group = groups.find((group) => group.id === coupon.groupId);

  const formattedDiscountAmount = coupon.discount_amount?.toLocaleString(
    "vi-VN",
    {
      // style: "currency",
      currency: "VND",
    }
  );

  const toggleCoupon = async () => {
    setIsLoading(true);
    await updateCouponAction({ ...coupon, used: !coupon.used });
    setIsLoading(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const { userId } = useAuth();

  return (
    <div className="flex justify-between items-start py-4 px-4 rounded-lg border border-slate-300 dark:border-slate-700">
      <div>
        {coupon.discount_amount && coupon.discount_amount > 0 && (
          <p className="text-md sm:text-4xl text-3xl font-semibold flex items-start mb-1">
            {formattedDiscountAmount}
            {/* <span className="text-xl ml-1">₫</span> */}
          </p>
        )}
        <p className="text-sm text-muted-foreground">Code</p>
        <button
          onClick={() => copyToClipboard(coupon.code)}
          className="text-lg flex gap-1 items-center"
        >
          {coupon.code} <CopyIcon className="h-4" />
        </button>
        <p className="text-sm text-muted-foreground">Date</p>
        <p className="text-lg">
          {date1.toLocaleDateString()}{" "}
          <span className="text-muted-foreground text-sm">
            {daysLeft < 0
              ? "Expired"
              : daysLeft == 1
              ? `${daysLeft} day left`
              : daysLeft != 0
              ? `${daysLeft} days left`
              : "Expire today"}
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
          onClick={toggleCoupon}
        >
          <CheckIcon className="h-4" />
        </Button>
        {/* {coupon.userId === userId && ( */}
        <Button variant={"link"} className="" onClick={() => setOpen(true)}>
          Edit
        </Button>
        {/* )} */}
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
