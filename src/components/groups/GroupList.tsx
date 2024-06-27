"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { type Group, CompleteGroup } from "@/lib/db/schema/groups";
import Modal from "@/components/shared/Modal";

import { useOptimisticGroups } from "@/app/(app)/groups/useOptimisticGroups";
import { Button } from "@/components/ui/button";
import GroupForm from "./GroupForm";
import { PlusIcon } from "lucide-react";
import { CouponGroup } from "@/lib/db/schema/associative";

type TOpenModal = (group?: Group) => void;

export default function GroupList({
  groups,
  couponGroups,
}: {
  groups: CompleteGroup[];
  couponGroups: CouponGroup[];
}) {
  console.log(groups);
  const { optimisticGroups, addOptimisticGroup } = useOptimisticGroups(groups);
  const [open, setOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState<Group | null>(null);
  const openModal = (group?: Group) => {
    setOpen(true);
    group ? setActiveGroup(group) : setActiveGroup(null);
  };
  const closeModal = () => setOpen(false);

  return (
    <div>
      <Modal
        open={open}
        setOpen={setOpen}
        title={activeGroup ? "Edit Group" : "Create Group"}
      >
        <GroupForm
          group={activeGroup}
          addOptimistic={addOptimisticGroup}
          openModal={openModal}
          closeModal={closeModal}
        />
      </Modal>
      <div className="absolute right-0 top-0 ">
        <Button onClick={() => openModal()} variant={"outline"}>
          +
        </Button>
      </div>
      {optimisticGroups.length === 0 ? (
        <EmptyState openModal={openModal} />
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-4 gap-2">
          {optimisticGroups.map((group) => (
            <Group
              group={group}
              key={group.id}
              openModal={openModal}
              couponGroups={couponGroups}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

const Group = ({
  group,
  openModal,
  couponGroups,
}: {
  group: CompleteGroup;
  openModal: TOpenModal;
  couponGroups: CouponGroup[];
}) => {
  // Total coupons in the group
  let totalCoupons = 0;
  for (let i = 0; i < couponGroups.length; i++) {
    if (couponGroups[i].group_id === group.id) totalCoupons++;
  }

  const optimistic = group.id === "optimistic";
  const deleting = group.id === "delete";
  const mutating = optimistic || deleting;
  const pathname = usePathname();
  const basePath = pathname.includes("groups")
    ? pathname
    : pathname + "/groups/";

  return (
    <li
      className={cn(
        "flex justify-between border p-4",
        mutating ? "opacity-30 animate-pulse" : "",
        deleting ? "text-destructive" : ""
      )}
    >
      <div className="flex flex-col gap-2">
        <Link
          href={basePath + "/" + group.id}
          className="text-xl hover:underline font-semibold"
        >
          {group.name}
        </Link>
        <div>Total Coupon: {totalCoupons}</div>
      </div>
      <Button variant={"link"} asChild>
        <Link href={basePath + "/" + group.id}>Edit</Link>
      </Button>
    </li>
  );
};

const EmptyState = ({ openModal }: { openModal: TOpenModal }) => {
  return (
    <div className="text-center">
      <h3 className="mt-2 text-sm font-semibold text-secondary-foreground">
        No groups
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Get started by creating a new group.
      </p>
      <div className="mt-6">
        <Button onClick={() => openModal()}>
          <PlusIcon className="h-4" /> New Groups{" "}
        </Button>
      </div>
    </div>
  );
};
