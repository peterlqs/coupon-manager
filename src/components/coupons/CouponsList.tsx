"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import Modal from "@/components/shared/Modal";

import { Button } from "@/components/ui/button";
import { CameraIcon, PlusIcon } from "lucide-react";
import { Coupon } from "@/lib/db/schema/coupons";
import CouponForm from "./CouponsForm";
import { Group, GroupId } from "@/lib/db/schema/groups";
import { z } from "zod";
import { Input } from "../ui/input";
import ImageInput from "./ImageInput";

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

  const [openImage, setOpenImage] = useState(false);
  const openModalImage = () => setOpenImage(true);
  const closeModalImage = () => setOpenImage(false);

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

  return (
    <div className="flex justify-between items-center border-b border-border py-2">
      <div>
        <h3 className="font-semibold text-xl">{coupon.code}</h3>
        {coupon.discount_amount && (
          <p className="text-md text-muted-foreground">
            {coupon.discount_amount} VND
          </p>
        )}
        <p className="text-sm text-muted-foreground">{formattedDate}</p>
        <p className="text-sm text-muted-foreground">
          {daysLeft != 0 ? `${daysLeft} day(s) left` : "Expire today"}
        </p>
        {group && (
          <p className="text-sm text-muted-foreground">Group: {group.name}</p>
        )}
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
