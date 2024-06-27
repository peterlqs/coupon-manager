import { type Group } from "@/lib/db/schema/groups";
import { type Coupon, type CompleteCoupon } from "@/lib/db/schema/coupons";
import { OptimisticAction } from "@/lib/utils";
import { useOptimistic } from "react";

export type TAddOptimistic = (action: OptimisticAction<Coupon>) => void;

export const useOptimisticCoupons = (
  coupons: CompleteCoupon[],
  groups: Group[]
) => {
  const [optimisticCoupons, addOptimisticCoupon] = useOptimistic(
    coupons,
    (
      currentState: CompleteCoupon[],
      action: OptimisticAction<Coupon>,
    ): CompleteCoupon[] => {
      const { data } = action;

      const optimisticGroup = groups.find(
        (group) => group.id === data.groupId,
      )!;

      const optimisticCoupon = {
        ...data,
        group: optimisticGroup,
        id: "optimistic",
      };

      switch (action.action) {
        case "create":
          return currentState.length === 0
            ? [optimisticCoupon]
            : [...currentState, optimisticCoupon];
        case "update":
          return currentState.map((item) =>
            item.id === data.id ? { ...item, ...optimisticCoupon } : item,
          );
        case "delete":
          return currentState.map((item) =>
            item.id === data.id ? { ...item, id: "delete" } : item,
          );
        default:
          return currentState;
      }
    },
  );

  return { addOptimisticCoupon, optimisticCoupons };
};
