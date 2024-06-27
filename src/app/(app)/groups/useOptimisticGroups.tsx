
import { type Group, type CompleteGroup } from "@/lib/db/schema/groups";
import { OptimisticAction } from "@/lib/utils";
import { useOptimistic } from "react";

export type TAddOptimistic = (action: OptimisticAction<Group>) => void;

export const useOptimisticGroups = (
  groups: CompleteGroup[],
  
) => {
  const [optimisticGroups, addOptimisticGroup] = useOptimistic(
    groups,
    (
      currentState: CompleteGroup[],
      action: OptimisticAction<Group>,
    ): CompleteGroup[] => {
      const { data } = action;

      

      const optimisticGroup = {
        ...data,
        
        id: "optimistic",
      };

      switch (action.action) {
        case "create":
          return currentState.length === 0
            ? [optimisticGroup]
            : [...currentState, optimisticGroup];
        case "update":
          return currentState.map((item) =>
            item.id === data.id ? { ...item, ...optimisticGroup } : item,
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

  return { addOptimisticGroup, optimisticGroups };
};
