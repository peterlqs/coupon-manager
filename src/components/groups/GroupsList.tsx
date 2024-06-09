"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import Modal from "@/components/shared/Modal";

import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { Group } from "@/lib/db/schema/groups";
import GroupForm from "./GroupForm";
import { getUserAuth } from "@/lib/auth/utils";

type TOpenModal = () => void;

export default function GroupsList({ groups }: { groups: Group[] }) {
  const [open, setOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState<Group | null>(null);
  const openModal = () => setOpen(true);
  const closeModal = () => setOpen(false);

  return (
    <div>
      <Modal open={open} setOpen={setOpen} title={"Create Group"}>
        <GroupForm
          group={activeGroup}
          openModal={openModal}
          closeModal={closeModal}
        />
      </Modal>
      <div className="absolute right-0 top-0 ">
        <Button onClick={openModal} variant={"outline"}>
          <PlusIcon />
        </Button>
      </div>
      {groups.length === 0 ? (
        <EmptyState openModal={openModal} />
      ) : (
        <div>
          {groups.map((group) => (
            <GroupItem key={group.id} group={group} />
          ))}
        </div>
      )}
    </div>
  );
}

const GroupItem = ({ group }: { group: Group }) => {
  return (
    <div className="flex justify-between items-center border-b border-border py-2">
      <div>
        <h3 className="font-semibold">{group.name}</h3>
      </div>
      <div>
        <Button variant={"link"} asChild>
          <Link href={"/groups/" + group.id}>Edit</Link>
          {/* <Link href={basePath + "/" + group.id}>Edit</Link> */}
        </Button>
      </div>
    </div>
  );
};

const EmptyState = ({ openModal }: { openModal: TOpenModal }) => {
  return (
    <div className="text-center">
      <h3 className="mt-2 text-sm font-semibold text-secondary-foreground">
        No groups
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Get started by creating a new group
      </p>
      <div className="mt-6">
        <Button onClick={() => openModal()}>
          <PlusIcon className="h-4" /> New Group{" "}
        </Button>
      </div>
    </div>
  );
};
