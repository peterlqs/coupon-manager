import { z } from "zod";
import { useState, useTransition } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { type Action, cn } from "@/lib/utils";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useBackPath } from "@/components/shared/BackButton";

import {
  type Coupon,
  NewCouponParams,
  insertCouponParams,
} from "@/lib/db/schema/coupons";
import {
  createCouponAction,
  deleteCouponAction,
  updateCouponAction,
} from "@/lib/actions/coupons";
import { parse } from "path";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Group, GroupId } from "@/lib/db/schema/groups";

const CouponForm = ({
  groups,
  groupsId,
  coupon,
  openModal,
  closeModal,
  postSuccess,
}: {
  groups?: Group[];
  groupsId?: GroupId;
  coupon?: Coupon | null;
  openModal?: (coupon?: Coupon) => void;
  closeModal?: () => void;
  postSuccess?: () => void;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    control,
  } = useForm<NewCouponParams>({
    // defaultValues: {
    //   code: coupon?.code ?? "",
    // },
  });

  const editing = !!coupon?.id;

  const [isDeleting, setIsDeleting] = useState(false);
  const [pending, startMutation] = useTransition();

  const router = useRouter();
  const backpath = useBackPath("coupons");

  const onSuccess = (
    action: Action,
    data?: { error: string; values: Coupon }
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
      toast.success(`Successfully ${action}d coupon!`);
      // if (action === "delete") router.push(backpath);
    }
  };

  // const onSubmit = async (data: NewCouponParams) => {
  const onSubmit: SubmitHandler<NewCouponParams> = async (data) => {
    console.log(data.group);
    console.log(typeof data.group);
    // Parse the form data
    const pendingCoupon: Coupon = {
      code: data.code,
      discount_amount:
        typeof data.discount_amount === "string"
          ? parseFloat(data.discount_amount)
          : data.discount_amount,
      expiration_date: new Date(data.expiration_date!),
      id: coupon?.id ?? "",
      userId: coupon?.userId ?? "",
      note: coupon?.note ?? "",
      store: coupon?.store ?? "",
      group: data.group,
      updatedAt: coupon?.updatedAt ?? new Date(),
      createdAt: coupon?.createdAt ?? new Date(),
    };

    try {
      startMutation(async () => {
        const error = editing
          ? await updateCouponAction(pendingCoupon)
          : await createCouponAction(pendingCoupon);

        const errorFormatted = {
          error: error ?? "Error",
          values: pendingCoupon,
        };
        onSuccess(
          editing ? "update" : "create",
          error ? errorFormatted : undefined
        );
      });
    } catch (e) {
      if (e instanceof z.ZodError) {
        // Handle Zod validation errors
        console.error(e);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={"space-y-8"}>
      {/* Schema fields start */}
      <div>
        <Label
          className={cn(
            "mb-2 inline-block",
            errors?.code ? "text-destructive" : ""
          )}
        >
          Code
        </Label>
        <Input
          type="text"
          className={cn(errors?.code ? "ring ring-destructive" : "")}
          {...register("code", { required: true })}
        />
        {errors?.code && (
          <p className="text-xs text-destructive mt-2">{errors.code.message}</p>
        )}
      </div>
      <div>
        <Label
          className={cn(
            "mb-2 inline-block",
            errors?.code ? "text-destructive" : ""
          )}
        >
          discount_amount
        </Label>
        <Input
          type="number"
          className={cn(errors?.code ? "ring ring-destructive" : "")}
          {...register("discount_amount", { required: true })}
        />
        {errors?.discount_amount && (
          <p className="text-xs text-destructive mt-2">
            {errors.discount_amount.message}
          </p>
        )}
      </div>

      <div>
        <Label
          className={cn(
            "mb-2 inline-block",
            errors?.code ? "text-destructive" : ""
          )}
        >
          expiration_date
        </Label>
        <Input
          type="date"
          className={cn(errors?.code ? "ring ring-destructive" : "")}
          {...register("expiration_date", { required: true })}
        />
        {errors?.expiration_date && (
          <p className="text-xs text-destructive mt-2">
            {errors.expiration_date.message}
          </p>
        )}
      </div>
      <div>
        <Label
          className={cn(
            "mb-2 inline-block",
            errors?.code ? "text-destructive" : ""
          )}
        >
          store
        </Label>
        <Input
          type="text"
          className={cn(errors?.code ? "ring ring-destructive" : "")}
          {...register("store", { required: true })}
        />
        {errors?.store && (
          <p className="text-xs text-destructive mt-2">
            {errors.store.message}
          </p>
        )}
      </div>
      <div>
        <Label
          className={cn(
            "mb-2 inline-block",
            errors?.code ? "text-destructive" : ""
          )}
        >
          note
        </Label>
        <Input
          type="text"
          className={cn(errors?.code ? "ring ring-destructive" : "")}
          {...register("note", { required: true })}
        />
        {errors?.note && (
          <p className="text-xs text-destructive mt-2">{errors.note.message}</p>
        )}
      </div>
      <div>
        <Controller
          control={control}
          name="group"
          render={({ field: { onChange, value } }) => (
            <Select defaultValue={groupsId} onValueChange={onChange}>
              <SelectTrigger
                className={cn(errors?.group ? "ring ring-destructive" : "")}
              >
                <SelectValue placeholder="Select a group" />
              </SelectTrigger>
              <SelectContent>
                {groups && groups.length !== 0 ? (
                  groups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="default">No groups</SelectItem>
                )}
              </SelectContent>
            </Select>
          )}
        />
        {errors?.group && (
          <p className="text-xs text-destructive mt-2">
            {errors.group.message}
          </p>
        )}
      </div>

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
              const error = await deleteCouponAction(coupon?.id);
              setIsDeleting(false);
              const errorFormatted = {
                error: error ?? "Error",
                values: coupon,
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

export default CouponForm;

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
