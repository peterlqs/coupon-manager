"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { type Furniture, CompleteFurniture } from "@/lib/db/schema/furnitures";
import Modal from "@/components/shared/Modal";

import { useOptimisticFurnitures } from "@/app/(app)/furnitures/useOptimisticFurnitures";
import { Button } from "@/components/ui/button";
import FurnitureForm from "./FurnitureForm";
import { PlusIcon } from "lucide-react";

type TOpenModal = (furniture?: Furniture) => void;

export default function FurnitureList({
  furnitures,
}: {
  furnitures: CompleteFurniture[];
}) {
  const { optimisticFurnitures, addOptimisticFurniture } =
    useOptimisticFurnitures(furnitures);
  const [open, setOpen] = useState(false);
  const [activeFurniture, setActiveFurniture] = useState<Furniture | null>(
    null
  );
  const openModal = (furniture?: Furniture) => {
    setOpen(true);
    furniture ? setActiveFurniture(furniture) : setActiveFurniture(null);
  };
  const closeModal = () => setOpen(false);

  return (
    <div>
      <Modal
        open={open}
        setOpen={setOpen}
        title={activeFurniture ? "Edit Furniture" : "Create Furniture"}
      >
        <FurnitureForm
          furniture={activeFurniture}
          addOptimistic={addOptimisticFurniture}
          openModal={openModal}
          closeModal={closeModal}
        />
      </Modal>
      <div className="absolute right-0 top-0 ">
        <Button onClick={() => openModal()} variant={"outline"}>
          +
        </Button>
      </div>
      {optimisticFurnitures.length === 0 ? (
        <EmptyState openModal={openModal} />
      ) : (
        <ul>
          {optimisticFurnitures.map((furniture) => (
            <Furniture
              furniture={furniture}
              key={furniture.id}
              openModal={openModal}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

const Furniture = ({
  furniture,
  openModal,
}: {
  furniture: CompleteFurniture;
  openModal: TOpenModal;
}) => {
  const optimistic = furniture.id === "optimistic";
  const deleting = furniture.id === "delete";
  const mutating = optimistic || deleting;
  const pathname = usePathname();
  const basePath = pathname.includes("furnitures")
    ? pathname
    : pathname + "/furnitures/";

  return (
    <li
      className={cn(
        "flex justify-between my-2",
        mutating ? "opacity-30 animate-pulse" : "",
        deleting ? "text-destructive" : ""
      )}
    >
      <div className="w-full">
        <div>{furniture.type}</div>
      </div>
      <Button variant={"link"} asChild>
        <Link href={basePath + "/" + furniture.id}>Edit</Link>
      </Button>
    </li>
  );
};

const EmptyState = ({ openModal }: { openModal: TOpenModal }) => {
  return (
    <div className="text-center">
      <h3 className="mt-2 text-sm font-semibold text-secondary-foreground">
        No furnitures
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Get started by creating a new furniture.
      </p>
      <div className="mt-6">
        <Button onClick={() => openModal()}>
          <PlusIcon className="h-4" /> New Furnitures{" "}
        </Button>
      </div>
    </div>
  );
};
