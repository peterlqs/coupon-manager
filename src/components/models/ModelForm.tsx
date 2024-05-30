import { z } from "zod";

import { useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useValidatedForm } from "@/lib/hooks/useValidatedForm";

import { type Action, cn } from "@/lib/utils";
import { type TAddOptimistic } from "@/app/(app)/models/useOptimisticModels";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useBackPath } from "@/components/shared/BackButton";


import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { type Model, insertModelParams } from "@/lib/db/schema/models";
import {
  createModelAction,
  deleteModelAction,
  updateModelAction,
} from "@/lib/actions/models";
import { type Furniture, type FurnitureId } from "@/lib/db/schema/furnitures";

const ModelForm = ({
  furnitures,
  furnitureId,
  model,
  openModal,
  closeModal,
  addOptimistic,
  postSuccess,
}: {
  model?: Model | null;
  furnitures: Furniture[];
  furnitureId?: FurnitureId
  openModal?: (model?: Model) => void;
  closeModal?: () => void;
  addOptimistic?: TAddOptimistic;
  postSuccess?: () => void;
}) => {
  const { errors, hasErrors, setErrors, handleChange } =
    useValidatedForm<Model>(insertModelParams);
  const editing = !!model?.id;
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [pending, startMutation] = useTransition();

  const router = useRouter();
  const backpath = useBackPath("models");


  const onSuccess = (
    action: Action,
    data?: { error: string; values: Model },
  ) => {
    const failed = Boolean(data?.error);
    if (failed) {
      openModal && openModal(data?.values);
      toast.error(`Failed to ${action}`, {
        description: data?.error ?? "Error",
      });
    } else {
      router.refresh();
      postSuccess && postSuccess();
      toast.success(`Model ${action}d!`);
      if (action === "delete") router.push(backpath);
    }
  };

  const handleSubmit = async (data: FormData) => {
    setErrors(null);

    const payload = Object.fromEntries(data.entries());
    const modelParsed = await insertModelParams.safeParseAsync({ furnitureId, ...payload });
    if (!modelParsed.success) {
      setErrors(modelParsed?.error.flatten().fieldErrors);
      return;
    }

    closeModal && closeModal();
    const values = modelParsed.data;
    const pendingModel: Model = {
      
      id: model?.id ?? "",
      userId: model?.userId ?? "",
      ...values,
    };
    try {
      startMutation(async () => {
        addOptimistic && addOptimistic({
          data: pendingModel,
          action: editing ? "update" : "create",
        });

        const error = editing
          ? await updateModelAction({ ...values, id: model.id })
          : await createModelAction(values);

        const errorFormatted = {
          error: error ?? "Error",
          values: pendingModel 
        };
        onSuccess(
          editing ? "update" : "create",
          error ? errorFormatted : undefined,
        );
      });
    } catch (e) {
      if (e instanceof z.ZodError) {
        setErrors(e.flatten().fieldErrors);
      }
    }
  };

  return (
    <form action={handleSubmit} onChange={handleChange} className={"space-y-8"}>
      {/* Schema fields start */}
              <div>
        <Label
          className={cn(
            "mb-2 inline-block",
            errors?.name ? "text-destructive" : "",
          )}
        >
          Name
        </Label>
        <Input
          type="text"
          name="name"
          className={cn(errors?.name ? "ring ring-destructive" : "")}
          defaultValue={model?.name ?? ""}
        />
        {errors?.name ? (
          <p className="text-xs text-destructive mt-2">{errors.name[0]}</p>
        ) : (
          <div className="h-6" />
        )}
      </div>

      {furnitureId ? null : <div>
        <Label
          className={cn(
            "mb-2 inline-block",
            errors?.furnitureId ? "text-destructive" : "",
          )}
        >
          Furniture
        </Label>
        <Select defaultValue={model?.furnitureId} name="furnitureId">
          <SelectTrigger
            className={cn(errors?.furnitureId ? "ring ring-destructive" : "")}
          >
            <SelectValue placeholder="Select a furniture" />
          </SelectTrigger>
          <SelectContent>
          {furnitures?.map((furniture) => (
            <SelectItem key={furniture.id} value={furniture.id.toString()}>
              {furniture.id}{/* TODO: Replace with a field from the furniture model */}
            </SelectItem>
           ))}
          </SelectContent>
        </Select>
        {errors?.furnitureId ? (
          <p className="text-xs text-destructive mt-2">{errors.furnitureId[0]}</p>
        ) : (
          <div className="h-6" />
        )}
      </div> }
      {/* Schema fields end */}

      {/* Save Button */}
      <SaveButton errors={hasErrors} editing={editing} />

      {/* Delete Button */}
      {editing ? (
        <Button
          type="button"
          disabled={isDeleting || pending || hasErrors}
          variant={"destructive"}
          onClick={() => {
            setIsDeleting(true);
            closeModal && closeModal();
            startMutation(async () => {
              addOptimistic && addOptimistic({ action: "delete", data: model });
              const error = await deleteModelAction(model.id);
              setIsDeleting(false);
              const errorFormatted = {
                error: error ?? "Error",
                values: model,
              };

              onSuccess("delete", error ? errorFormatted : undefined);
            });
          }}
        >
          Delet{isDeleting ? "ing..." : "e"}
        </Button>
      ) : null}
    </form>
  );
};

export default ModelForm;

const SaveButton = ({
  editing,
  errors,
}: {
  editing: Boolean;
  errors: boolean;
}) => {
  const { pending } = useFormStatus();
  const isCreating = pending && editing === false;
  const isUpdating = pending && editing === true;
  return (
    <Button
      type="submit"
      className="mr-2"
      disabled={isCreating || isUpdating || errors}
      aria-disabled={isCreating || isUpdating || errors}
    >
      {editing
        ? `Sav${isUpdating ? "ing..." : "e"}`
        : `Creat${isCreating ? "ing..." : "e"}`}
    </Button>
  );
};
