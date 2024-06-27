import { Suspense } from "react";
import { notFound } from "next/navigation";

import { getFurnitureByIdWithModels } from "@/lib/api/furnitures/queries";
import OptimisticFurniture from "./OptimisticFurniture";
import { checkAuth } from "@/lib/auth/utils";
import ModelList from "@/components/models/ModelList";

import { BackButton } from "@/components/shared/BackButton";
import Loading from "@/app/loading";

export const revalidate = 0;

export default async function FurniturePage({
  params,
}: {
  params: { furnitureId: string };
}) {
  return (
    <main className="overflow-auto">
      <Furniture id={params.furnitureId} />
    </main>
  );
}

const Furniture = async ({ id }: { id: string }) => {
  await checkAuth();

  const { furniture, models } = await getFurnitureByIdWithModels(id);
  if (!furniture) notFound();
  return (
    <Suspense fallback={<Loading />}>
      <div className="relative">
        <BackButton currentResource="furnitures" />
        <OptimisticFurniture furniture={furniture} />
      </div>
      <div className="relative mt-8 mx-4">
        <h3 className="text-xl font-medium mb-4">
          {furniture.type}&apos;s Models
        </h3>
        <ModelList furnitures={[]} furnitureId={furniture.id} models={models} />
      </div>
    </Suspense>
  );
};
