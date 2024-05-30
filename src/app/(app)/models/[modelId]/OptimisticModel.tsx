"use client";

import { useOptimistic, useState } from "react";
import { TAddOptimistic } from "@/app/(app)/models/useOptimisticModels";
import { type Model } from "@/lib/db/schema/models";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import Modal from "@/components/shared/Modal";
import ModelForm from "@/components/models/ModelForm";
import { type Furniture, type FurnitureId } from "@/lib/db/schema/furnitures";

export default function OptimisticModel({ 
  model,
  furnitures,
  furnitureId 
}: { 
  model: Model; 
  
  furnitures: Furniture[];
  furnitureId?: FurnitureId
}) {
  const [open, setOpen] = useState(false);
  const openModal = (_?: Model) => {
    setOpen(true);
  };
  const closeModal = () => setOpen(false);
  const [optimisticModel, setOptimisticModel] = useOptimistic(model);
  const updateModel: TAddOptimistic = (input) =>
    setOptimisticModel({ ...input.data });

  return (
    <div className="m-4">
      <Modal open={open} setOpen={setOpen}>
        <ModelForm
          model={optimisticModel}
          furnitures={furnitures}
        furnitureId={furnitureId}
          closeModal={closeModal}
          openModal={openModal}
          addOptimistic={updateModel}
        />
      </Modal>
      <div className="flex justify-between items-end mb-4">
        <h1 className="font-semibold text-2xl">{optimisticModel.name}</h1>
        <Button className="" onClick={() => setOpen(true)}>
          Edit
        </Button>
      </div>
      <pre
        className={cn(
          "bg-secondary p-4 rounded-lg break-all text-wrap",
          optimisticModel.id === "optimistic" ? "animate-pulse" : "",
        )}
      >
        {JSON.stringify(optimisticModel, null, 2)}
      </pre>
    </div>
  );
}
