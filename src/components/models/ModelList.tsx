"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { type Model, CompleteModel } from "@/lib/db/schema/models";
import Modal from "@/components/shared/Modal";
import { type Furniture, type FurnitureId } from "@/lib/db/schema/furnitures";
import { useOptimisticModels } from "@/app/(app)/models/useOptimisticModels";
import { Button } from "@/components/ui/button";
import ModelForm from "./ModelForm";
import { PlusIcon } from "lucide-react";

type TOpenModal = (model?: Model) => void;

export default function ModelList({
  models,
  furnitures,
  furnitureId 
}: {
  models: CompleteModel[];
  furnitures: Furniture[];
  furnitureId?: FurnitureId 
}) {
  const { optimisticModels, addOptimisticModel } = useOptimisticModels(
    models,
    furnitures 
  );
  const [open, setOpen] = useState(false);
  const [activeModel, setActiveModel] = useState<Model | null>(null);
  const openModal = (model?: Model) => {
    setOpen(true);
    model ? setActiveModel(model) : setActiveModel(null);
  };
  const closeModal = () => setOpen(false);

  return (
    <div>
      <Modal
        open={open}
        setOpen={setOpen}
        title={activeModel ? "Edit Model" : "Create Model"}
      >
        <ModelForm
          model={activeModel}
          addOptimistic={addOptimisticModel}
          openModal={openModal}
          closeModal={closeModal}
          furnitures={furnitures}
        furnitureId={furnitureId}
        />
      </Modal>
      <div className="absolute right-0 top-0 ">
        <Button onClick={() => openModal()} variant={"outline"}>
          +
        </Button>
      </div>
      {optimisticModels.length === 0 ? (
        <EmptyState openModal={openModal} />
      ) : (
        <ul>
          {optimisticModels.map((model) => (
            <Model
              model={model}
              key={model.id}
              openModal={openModal}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

const Model = ({
  model,
  openModal,
}: {
  model: CompleteModel;
  openModal: TOpenModal;
}) => {
  const optimistic = model.id === "optimistic";
  const deleting = model.id === "delete";
  const mutating = optimistic || deleting;
  const pathname = usePathname();
  const basePath = pathname.includes("models")
    ? pathname
    : pathname + "/models/";


  return (
    <li
      className={cn(
        "flex justify-between my-2",
        mutating ? "opacity-30 animate-pulse" : "",
        deleting ? "text-destructive" : "",
      )}
    >
      <div className="w-full">
        <div>{model.name}</div>
      </div>
      <Button variant={"link"} asChild>
        <Link href={ basePath + "/" + model.id }>
          Edit
        </Link>
      </Button>
    </li>
  );
};

const EmptyState = ({ openModal }: { openModal: TOpenModal }) => {
  return (
    <div className="text-center">
      <h3 className="mt-2 text-sm font-semibold text-secondary-foreground">
        No models
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Get started by creating a new model.
      </p>
      <div className="mt-6">
        <Button onClick={() => openModal()}>
          <PlusIcon className="h-4" /> New Models </Button>
      </div>
    </div>
  );
};
