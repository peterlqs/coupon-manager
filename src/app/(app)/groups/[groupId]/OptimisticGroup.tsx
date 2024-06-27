"use client";

import { useOptimistic, useState } from "react";
import { TAddOptimistic } from "@/app/(app)/groups/useOptimisticGroups";
import { type Group } from "@/lib/db/schema/groups";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import Modal from "@/components/shared/Modal";
import GroupForm from "@/components/groups/GroupForm";
import { getUserGroup } from "@/lib/api/associative/queries";
import { getUserAuth } from "@/lib/auth/utils";

export default async function OptimisticGroup({
  group,
  users_email,
}: {
  group: Group;
  users_email: string[];
}) {
  const [open, setOpen] = useState(false);
  const openModal = (_?: Group) => {
    setOpen(true);
  };
  const closeModal = () => setOpen(false);
  const [optimisticGroup, setOptimisticGroup] = useOptimistic(group);
  const updateGroup: TAddOptimistic = (input) =>
    setOptimisticGroup({ ...input.data });

  return (
    <div className="m-4">
      <Modal open={open} setOpen={setOpen}>
        <GroupForm
          group={optimisticGroup}
          closeModal={closeModal}
          openModal={openModal}
          addOptimistic={updateGroup}
          user_emails={users_email}
        />
      </Modal>

      <div className="p-4 pb-8 mt-4 rounded-lg border border-secondary">
        <div className="flex justify-between items-end mb-4">
          <h1 className="font-semibold text-2xl">{optimisticGroup.name}</h1>
          {optimisticGroup.name !== "Default" && (
            <Button
              variant={"secondary"}
              className=""
              onClick={() => setOpen(true)}
            >
              Edit
            </Button>
          )}
        </div>
        <div className="flex flex-col gap-2 items-start flex-wrap">
          <p className="rounded-lg ">{optimisticGroup.description}</p>
          <div className="flex gap-2 items-center">
            <p>Members: </p>
            {users_email.map((user) => (
              <p className="bg-secondary rounded-lg px-2 " key={user}>
                {user}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
