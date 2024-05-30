
import { type Furniture, type CompleteFurniture } from "@/lib/db/schema/furnitures";
import { OptimisticAction } from "@/lib/utils";
import { useOptimistic } from "react";

export type TAddOptimistic = (action: OptimisticAction<Furniture>) => void;

export const useOptimisticFurnitures = (
  furnitures: CompleteFurniture[],
  
) => {
  const [optimisticFurnitures, addOptimisticFurniture] = useOptimistic(
    furnitures,
    (
      currentState: CompleteFurniture[],
      action: OptimisticAction<Furniture>,
    ): CompleteFurniture[] => {
      const { data } = action;

      

      const optimisticFurniture = {
        ...data,
        
        id: "optimistic",
      };

      switch (action.action) {
        case "create":
          return currentState.length === 0
            ? [optimisticFurniture]
            : [...currentState, optimisticFurniture];
        case "update":
          return currentState.map((item) =>
            item.id === data.id ? { ...item, ...optimisticFurniture } : item,
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

  return { addOptimisticFurniture, optimisticFurnitures };
};
