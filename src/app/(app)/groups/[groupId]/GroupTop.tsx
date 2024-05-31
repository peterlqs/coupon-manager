"use client";

import GroupForm from "@/components/groups/GroupForm";
import Modal from "@/components/shared/Modal";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Group } from "@/lib/db/schema/groups";
import { UserGroup } from "@/lib/db/schema/associative";

export default function GroupTop({
  group,
  user_groups,
}: {
  group: Group;
  user_groups: UserGroup[];
}) {
  const [open, setOpen] = useState(false);
  const openModal = (_?: Group) => {
    setOpen(true);
  };
  const closeModal = () => setOpen(false);

  return (
    <div className="m-4">
      <Modal open={open} setOpen={setOpen}>
        <GroupForm
          group={group}
          user_groups={user_groups}
          openModal={openModal}
          closeModal={closeModal}
        />
      </Modal>
      <div className="flex justify-between items-end mb-4">
        <h1 className="font-semibold text-2xl">{group.name}</h1>
        <Button className="" onClick={() => setOpen(true)}>
          Edit
        </Button>
      </div>
    </div>
  );
}
