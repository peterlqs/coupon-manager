import { z } from "zod";
import { useState, useTransition } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { type Action, cn } from "@/lib/utils";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useBackPath } from "@/components/shared/BackButton";

import {
  type Group,
  NewGroupParams,
  insertGroupParams,
} from "@/lib/db/schema/groups";
import {
  createGroupAction,
  deleteGroupAction,
  updateGroupAction,
} from "@/lib/actions/groups";

const GroupForm = ({
  group,
  openModal,
  closeModal,
  postSuccess,
}: {
  group?: Group | null;
  openModal?: (group?: Group) => void;
  closeModal?: () => void;
  postSuccess?: () => void;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NewGroupParams>({
    // defaultValues: {
    //   code: coupon?.code ?? "",
    // },
  });

  const editing = !!group?.id;

  const [isDeleting, setIsDeleting] = useState(false);
  const [pending, startMutation] = useTransition();

  const router = useRouter();
  const backpath = useBackPath("groups");

  const onSuccess = (
    action: Action,
    data?: { error: string; values: Group }
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
      toast.success(`Successfully ${action}d group!`);
      if (action === "delete") router.push(backpath);
    }
  };

  // const onSubmit = async (data: NewCouponParams) => {
  const onSubmit: SubmitHandler<NewGroupParams> = async (data) => {
    // Parse the form data
    const pendingGroup: Group = {
      name: data.name,
      description: data.description,
      createdAt: new Date(),
      updatedAt: new Date(),
      id: group?.id ?? "",
      userId: group?.userId ?? "",
    };

    const error = await createGroupAction(pendingGroup);
    if (error) {
      const errorFormatted = {
        error: error ?? "Error",
        values: pendingGroup,
      };
      onSuccess("create", error ? errorFormatted : undefined);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={"space-y-8"}>
      {/* Schema fields start */}
      <div>
        <Label
          className={cn(
            "mb-2 inline-block",
            errors?.name ? "text-destructive" : ""
          )}
        >
          Name
        </Label>
        <Input
          type="text"
          className={cn(errors?.name ? "ring ring-destructive" : "")}
          {...register("name", { required: true })}
        />
        {errors?.name && (
          <p className="text-xs text-destructive mt-2">{errors.name.message}</p>
        )}
      </div>

      <div>
        <Label
          className={cn(
            "mb-2 inline-block",
            errors?.description ? "text-destructive" : ""
          )}
        >
          Description
        </Label>
        <Input
          type="text"
          className={cn(errors?.description ? "ring ring-destructive" : "")}
          {...register("description", { required: true })}
        />
        {errors?.description && (
          <p className="text-xs text-destructive mt-2">
            {errors.description.message}
          </p>
        )}
      </div>
      {/* Add more fields for your group schema */}

      {/* Schema fields end */}

      {/* Save Button */}
      <SaveButton editing={editing} errors={errors ? false : true} />

      {/* Delete Button */}
      {editing ? (
        <Button
          type="button"
          disabled={isDeleting || isSubmitting}
          variant={"destructive"}
          onClick={() => {
            setIsDeleting(true);
            closeModal && closeModal();
            startMutation(async () => {
              const error = await deleteGroupAction(group?.id);
              setIsDeleting(false);
              const errorFormatted = {
                error: error ?? "Error",
                values: group,
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

export default GroupForm;

const SaveButton = ({
  editing,
  errors,
}: {
  editing: Boolean;
  errors: boolean;
}) => {
  const isCreating = !editing && errors;
  const isUpdating = editing && errors;
  return (
    <Button
      type="submit"
      className="mr-2"
      disabled={isCreating || isUpdating}
      aria-disabled={isCreating || isUpdating}
    >
      {editing
        ? `Sav${isUpdating ? "ing..." : "e"}`
        : `Creat${isCreating ? "ing..." : "e"}`}
    </Button>
  );
};
