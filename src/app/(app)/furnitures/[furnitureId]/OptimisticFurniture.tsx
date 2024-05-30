"use client";

import { useOptimistic, useState } from "react";
import { TAddOptimistic } from "@/app/(app)/furnitures/useOptimisticFurnitures";
import { type Furniture } from "@/lib/db/schema/furnitures";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import Modal from "@/components/shared/Modal";
import FurnitureForm from "@/components/furnitures/FurnitureForm";


export default function OptimisticFurniture({ 
  furniture,
   
}: { 
  furniture: Furniture; 
  
  
}) {
  const [open, setOpen] = useState(false);
  const openModal = (_?: Furniture) => {
    setOpen(true);
  };
  const closeModal = () => setOpen(false);
  const [optimisticFurniture, setOptimisticFurniture] = useOptimistic(furniture);
  const updateFurniture: TAddOptimistic = (input) =>
    setOptimisticFurniture({ ...input.data });

  return (
    <div className="m-4">
      <Modal open={open} setOpen={setOpen}>
        <FurnitureForm
          furniture={optimisticFurniture}
          
          closeModal={closeModal}
          openModal={openModal}
          addOptimistic={updateFurniture}
        />
      </Modal>
      <div className="flex justify-between items-end mb-4">
        <h1 className="font-semibold text-2xl">{optimisticFurniture.type}</h1>
        <Button className="" onClick={() => setOpen(true)}>
          Edit
        </Button>
      </div>
      <pre
        className={cn(
          "bg-secondary p-4 rounded-lg break-all text-wrap",
          optimisticFurniture.id === "optimistic" ? "animate-pulse" : "",
        )}
      >
        {JSON.stringify(optimisticFurniture, null, 2)}
      </pre>
    </div>
  );
}
