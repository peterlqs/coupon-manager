import { z } from "zod";

import { useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useValidatedForm } from "@/lib/hooks/useValidatedForm";

import { type Action, cn } from "@/lib/utils";
import { type TAddOptimistic } from "@/app/(app)/coupons/useOptimisticCoupons";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useBackPath } from "@/components/shared/BackButton";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { type Coupon, insertCouponParams } from "@/lib/db/schema/coupons";
import {
  createCouponAction,
  deleteCouponAction,
  updateCouponAction,
} from "@/lib/actions/coupons";
import { type Group, type GroupId } from "@/lib/db/schema/groups";
import ImageInput from "./ImageInput";

const CouponForm = ({
  groups,
  groupId,
  coupon,
  openModal,
  closeModal,
  addOptimistic,
  postSuccess,
}: {
  coupon?: Coupon | null;
  groups: Group[];
  groupId?: GroupId;
  openModal?: (coupon?: Coupon) => void;
  closeModal?: () => void;
  addOptimistic?: TAddOptimistic;
  postSuccess?: () => void;
}) => {
  // Get Default group id
  const defaultGroup = groups?.find((group) => group.name === "Default");

  const { errors, hasErrors, setErrors, handleChange } =
    useValidatedForm<Coupon>(insertCouponParams);
  const editing = !!coupon?.id;
  const [expiration_date, setExpiration_date] = useState<Date | undefined>(
    coupon?.expiration_date
  );

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
      toast.success(`Coupon ${action}d!`);
      if (action === "delete") router.push(backpath);
    }
  };

  const handleSubmit = async (data: FormData) => {
    setErrors(null);

    const payload = Object.fromEntries(data.entries());
    const couponParsed = await insertCouponParams.safeParseAsync({
      groupId,
      ...payload,
    });
    if (!couponParsed.success) {
      setErrors(couponParsed?.error.flatten().fieldErrors);
      return;
    }

    closeModal && closeModal();
    const values = couponParsed.data;
    const pendingCoupon: Coupon = {
      id: coupon?.id ?? "",
      userId: coupon?.userId ?? "",
      updatedAt: coupon?.updatedAt ?? new Date(),
      createdAt: coupon?.createdAt ?? new Date(),
      ...values,
    };
    try {
      startMutation(async () => {
        addOptimistic &&
          addOptimistic({
            data: pendingCoupon,
            action: editing ? "update" : "create",
          });

        const error = editing
          ? await updateCouponAction({
              ...values,
              id: coupon.id,
            })
          : await createCouponAction(values);

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
        setErrors(e.flatten().fieldErrors);
      }
    }
  };

  return (
    <div>
      {/* <div className="mb-3">
        {!editing && <ImageInput couponForm={couponForm} />}
      </div> */}
      <form
        action={handleSubmit}
        onChange={handleChange}
        className={"space-y-3"}
      >
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
            name="code"
            className={cn(errors?.code ? "ring ring-destructive" : "")}
            defaultValue={coupon?.code ?? ""}
          />
          {errors?.code && (
            <p className="text-xs text-destructive mt-2">{errors.code[0]}</p>
          )}
        </div>
        <div>
          <Label
            className={cn(
              "mb-2 inline-block",
              errors?.discount_amount ? "text-destructive" : ""
            )}
          >
            Discount Amount
          </Label>
          <Input
            type="number"
            name="discount_amount"
            required
            className={cn(
              errors?.discount_amount ? "ring ring-destructive" : ""
            )}
            defaultValue={coupon?.discount_amount ?? undefined}
          />
          {errors?.discount_amount && (
            <p className="text-xs text-destructive mt-2">
              {errors.discount_amount[0]}
            </p>
          )}
        </div>
        <div>
          <Label
            className={cn(
              "mb-2 inline-block",
              errors?.expiration_date ? "text-destructive" : ""
            )}
          >
            Expiration Date
          </Label>
          <br />
          <Popover>
            <Input
              name="expiration_date"
              onChange={() => {}}
              readOnly
              value={expiration_date?.toUTCString() ?? new Date().toUTCString()}
              className="hidden"
            />
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[240px] pl-3 text-left font-normal",
                  !coupon?.expiration_date && "text-muted-foreground"
                )}
              >
                {expiration_date ? (
                  <span>{format(expiration_date, "PPP")}</span>
                ) : (
                  <span>Pick a date</span>
                )}
                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                onSelect={(e) => setExpiration_date(e)}
                selected={expiration_date}
                disabled={(date) =>
                  date > new Date() || date < new Date("1900-01-01")
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {errors?.expiration_date && (
            <p className="text-xs text-destructive mt-2">
              {errors.expiration_date[0]}
            </p>
          )}
        </div>
        <div>
          <Label
            className={cn(
              "mb-2 inline-block",
              errors?.store ? "text-destructive" : ""
            )}
          >
            Store
          </Label>
          <Input
            type="text"
            name="store"
            className={cn(errors?.store ? "ring ring-destructive" : "")}
            defaultValue={coupon?.store ?? ""}
          />
          {errors?.store && (
            <p className="text-xs text-destructive mt-2">{errors.store[0]}</p>
          )}
        </div>
        <div>
          <Label
            className={cn(
              "mb-2 inline-block",
              errors?.note ? "text-destructive" : ""
            )}
          >
            Note
          </Label>
          <Input
            type="text"
            name="note"
            className={cn(errors?.note ? "ring ring-destructive" : "")}
            defaultValue={coupon?.note ?? ""}
          />
          {errors?.note && (
            <p className="text-xs text-destructive mt-2">{errors.note[0]}</p>
          )}
        </div>
        {/* <div>
          <Label
            className={cn(
              "mb-2 inline-block",
              errors?.groupId ? "text-destructive" : ""
            )}
          >
            Group
          </Label>
          <Input
            type="text"
            name="groupId"
            className={cn(errors?.groupId ? "ring ring-destructive" : "")}
            defaultValue={coupon?.groupId ?? ""}
          />
          {errors?.groupId? && (
            <p className="text-xs text-destructive mt-2">{errors.groupId[0]}</p>
          )}
        </div> */}
        <div>
          <Label
            className={cn(
              "mb-2 inline-block",
              errors?.groupId ? "text-destructive" : ""
            )}
          >
            Group
          </Label>
          <Select defaultValue={coupon?.groupId ?? defaultGroup?.id}>
            <SelectTrigger
              className={cn(errors?.groupId ? "ring ring-destructive" : "")}
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
          {errors?.groupId && (
            <p className="text-xs text-destructive mt-2">{errors.groupId[0]}</p>
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
