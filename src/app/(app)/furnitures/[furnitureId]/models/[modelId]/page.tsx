import { Suspense } from "react";
import { notFound } from "next/navigation";

import { getModelById } from "@/lib/api/models/queries";
import { getFurnitures } from "@/lib/api/furnitures/queries";import OptimisticModel from "@/app/(app)/models/[modelId]/OptimisticModel";
import { checkAuth } from "@/lib/auth/utils";


import { BackButton } from "@/components/shared/BackButton";
import Loading from "@/app/loading";


export const revalidate = 0;

export default async function ModelPage({
  params,
}: {
  params: { modelId: string };
}) {

  return (
    <main className="overflow-auto">
      <Model id={params.modelId} />
    </main>
  );
}

const Model = async ({ id }: { id: string }) => {
  await checkAuth();

  const { model } = await getModelById(id);
  const { furnitures } = await getFurnitures();

  if (!model) notFound();
  return (
    <Suspense fallback={<Loading />}>
      <div className="relative">
        <BackButton currentResource="models" />
        <OptimisticModel model={model} furnitures={furnitures}
        furnitureId={model.furnitureId} />
      </div>
    </Suspense>
  );
};
