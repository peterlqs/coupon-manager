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
import ImageInput from "./ImageInput";
import { TAddOptimistic } from "@/app/(app)/coupons/useOptimisticCoupons";

const CouponForm = ({
  groups,
  groupId,
  coupon,
  openModal,
  addOptimistic,

  closeModal,
  postSuccess,
}: {
  groups?: Group[];
  groupId?: GroupId;
  coupon?: Coupon | null;
  addOptimistic?: TAddOptimistic;

  openModal?: (coupon?: Coupon) => void;
  closeModal?: () => void;
  postSuccess?: () => void;
}) => {
  // convert expiration date to yyyy-mm-dd format
  const expiration_date = coupon?.expiration_date
    ? new Date(coupon.expiration_date).toISOString().split("T")[0]
    : "";
  // Get Default group id
  const defaultGroup = groups?.find((group) => group.name === "Default");
  const couponForm = useForm<NewCouponParams>({
    defaultValues: {
      code: coupon?.code ?? "",
      discount_amount: coupon?.discount_amount,
      // expiration_date: coupon?.expiration_date ?? new Date(),
      expiration_date: expiration_date as unknown as Date,
      groupId: coupon?.groupId ?? groupId ?? defaultGroup?.id,
      note: coupon?.note,
      store: coupon?.store ?? "",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isLoading },
    control,
  } = couponForm;

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
    const pendingCoupon: Coupon = {
      id: coupon?.id ?? "",
      userId: coupon?.userId ?? "",
      updatedAt: coupon?.updatedAt ?? new Date(),
      createdAt: coupon?.createdAt ?? new Date(),
      code: data.code,
      discount_amount:
        data.discount_amount && !isNaN(parseFloat(String(data.discount_amount)))
          ? parseFloat(String(data.discount_amount))
          : 0,
      expiration_date: new Date(data.expiration_date!),
      note: data?.note ?? "",
      store: data?.store ?? "",
      groupId: data.groupId ?? "Default",
      used: coupon?.used ?? false,
      // ...data,
    };

    closeModal && closeModal();

    try {
      startMutation(async () => {
        addOptimistic &&
          addOptimistic({
            data: pendingCoupon,
            action: editing ? "update" : "create",
          });

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
        couponForm.reset();
      });
    } catch (e) {
      if (e instanceof z.ZodError) {
        // Handle Zod validation errors
        console.error(e);
      }
    }
  };

  return (
    <div>
      <div className="mb-3">
        {!editing && <ImageInput couponForm={couponForm} />}
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className={"space-y-3"}>
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
            <p className="text-xs text-destructive mt-2">
              {errors.code.message}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <div>
            <Label
              className={cn(
                "mb-2 inline-block",
                errors?.code ? "text-destructive" : ""
              )}
            >
              Discount Amount
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
              Store
            </Label>
            <Input
              type="text"
              className={cn(errors?.code ? "ring ring-destructive" : "")}
              {...register("store", { required: false })}
            />
            {errors?.store && (
              <p className="text-xs text-destructive mt-2">
                {errors.store.message}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <Label
              className={cn(
                "mb-2 inline-block",
                errors?.code ? "text-destructive" : ""
              )}
            >
              Expiration Date
            </Label>
            <Input
              type="date"
              className={cn(errors?.code ? "ring ring-destructive" : "")}
              {...register("expiration_date", {
                required: true,
                valueAsDate: false,
              })}
            />
            {errors?.expiration_date && (
              <p className="text-xs text-destructive mt-2">
                {errors.expiration_date.message}
              </p>
            )}
          </div>
          <div className="flex-1">
            <Label
              className={cn(
                "mb-2 inline-block",
                errors?.code ? "text-destructive" : ""
              )}
            >
              Group
            </Label>
            <Controller
              control={control}
              name="groupId"
              render={({ field: { onChange, value } }) => (
                <Select
                  defaultValue={coupon?.groupId ?? groupId ?? defaultGroup?.id}
                  onValueChange={onChange}
                >
                  <SelectTrigger
                    className={cn(
                      errors?.groupId ? "ring ring-destructive" : ""
                    )}
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
            {errors?.groupId && (
              <p className="text-xs text-destructive mt-2">
                {errors.groupId.message}
              </p>
            )}
          </div>
        </div>
        <div>
          <Label
            className={cn(
              "mb-2 inline-block",
              errors?.code ? "text-destructive" : ""
            )}
          >
            Note
          </Label>
          <Input
            type="text"
            className={cn(errors?.code ? "ring ring-destructive" : "")}
            {...register("note", { required: false })}
          />
          {errors?.note && (
            <p className="text-xs text-destructive mt-2">
              {errors.note.message}
            </p>
          )}
        </div>
        <div className="h-2"></div>
        {/* Schema fields end */}
        {/* Save Button */}
        <SaveButton editing={editing} isSubmitting={isSubmitting} />
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
                addOptimistic &&
                  addOptimistic({ action: "delete", data: coupon });
                const error = await deleteCouponAction(coupon.id);
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
    </div>
  );
};

export default CouponForm;

const SaveButton = ({
  editing,
  isSubmitting,
}: {
  editing: Boolean;
  isSubmitting: boolean;
}) => {
  const isCreating = !editing && isSubmitting;
  const isUpdating = editing && isSubmitting;
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
