import { z } from "zod";

import { useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useValidatedForm } from "@/lib/hooks/useValidatedForm";

import { type Action, cn } from "@/lib/utils";
import { type TAddOptimistic } from "@/app/(app)/furnitures/useOptimisticFurnitures";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useBackPath } from "@/components/shared/BackButton";

import {
  type Furniture,
  insertFurnitureParams,
} from "@/lib/db/schema/furnitures";
import {
  createFurnitureAction,
  deleteFurnitureAction,
  updateFurnitureAction,
} from "@/lib/actions/furnitures";

const FurnitureForm = ({
  furniture,
  openModal,
  closeModal,
  addOptimistic,
  postSuccess,
}: {
  furniture?: Furniture | null;

  openModal?: (furniture?: Furniture) => void;
  closeModal?: () => void;
  addOptimistic?: TAddOptimistic;
  postSuccess?: () => void;
}) => {
  const { errors, hasErrors, setErrors, handleChange } =
    useValidatedForm<Furniture>(insertFurnitureParams);
  const editing = !!furniture?.id;

  const [isDeleting, setIsDeleting] = useState(false);
  const [pending, startMutation] = useTransition();

  const router = useRouter();
  const backpath = useBackPath("furnitures");

  const onSuccess = (
    action: Action,
    data?: { error: string; values: Furniture }
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
      toast.success(`Furniture ${action}d!`);
      if (action === "delete") router.push(backpath);
    }
  };

  const handleSubmit = async (data: FormData) => {
    setErrors(null);

    const payload = Object.fromEntries(data.entries());
    const furnitureParsed = await insertFurnitureParams.safeParseAsync({
      ...payload,
    });
    if (!furnitureParsed.success) {
      setErrors(furnitureParsed?.error.flatten().fieldErrors);
      return;
    }
    closeModal && closeModal();
    const values = furnitureParsed.data;
    const pendingFurniture: Furniture = {
      updatedAt: furniture?.updatedAt ?? new Date(),
      createdAt: furniture?.createdAt ?? new Date(),
      id: furniture?.id ?? "",
      userId: furniture?.userId ?? "",
      ...values,
    };
    try {
      startMutation(async () => {
        addOptimistic &&
          addOptimistic({
            data: pendingFurniture,
            action: editing ? "update" : "create",
          });

        const error = editing
          ? await updateFurnitureAction({ ...values, id: furniture.id })
          : await createFurnitureAction(values);

        const errorFormatted = {
          error: error ?? "Error",
          values: pendingFurniture,
        };
        onSuccess(
          editing ? "update" : "create",
          error ? errorFormatted : undefined
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
            errors?.type ? "text-destructive" : ""
          )}
        >
          Type
        </Label>
        <Input
          type="text"
          name="type"
          className={cn(errors?.type ? "ring ring-destructive" : "")}
          defaultValue={furniture?.type ?? ""}
        />
        {errors?.type ? (
          <p className="text-xs text-destructive mt-2">{errors.type[0]}</p>
        ) : (
          <div className="h-6" />
        )}
      </div>
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
              addOptimistic &&
                addOptimistic({ action: "delete", data: furniture });
              const error = await deleteFurnitureAction(furniture.id);
              setIsDeleting(false);
              const errorFormatted = {
                error: error ?? "Error",
                values: furniture,
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

export default FurnitureForm;

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
