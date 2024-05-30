import { type Furniture } from "@/lib/db/schema/furnitures";
import { type Model, type CompleteModel } from "@/lib/db/schema/models";
import { OptimisticAction } from "@/lib/utils";
import { useOptimistic } from "react";

export type TAddOptimistic = (action: OptimisticAction<Model>) => void;

export const useOptimisticModels = (
  models: CompleteModel[],
  furnitures: Furniture[]
) => {
  const [optimisticModels, addOptimisticModel] = useOptimistic(
    models,
    (
      currentState: CompleteModel[],
      action: OptimisticAction<Model>,
    ): CompleteModel[] => {
      const { data } = action;

      const optimisticFurniture = furnitures.find(
        (furniture) => furniture.id === data.furnitureId,
      )!;

      const optimisticModel = {
        ...data,
        furniture: optimisticFurniture,
        id: "optimistic",
      };

      switch (action.action) {
        case "create":
          return currentState.length === 0
            ? [optimisticModel]
            : [...currentState, optimisticModel];
        case "update":
          return currentState.map((item) =>
            item.id === data.id ? { ...item, ...optimisticModel } : item,
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

  return { addOptimisticModel, optimisticModels };
};
