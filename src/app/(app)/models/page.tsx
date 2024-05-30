import { Suspense } from "react";

import Loading from "@/app/loading";
import ModelList from "@/components/models/ModelList";
import { getModels } from "@/lib/api/models/queries";
import { getFurnitures } from "@/lib/api/furnitures/queries";
import { checkAuth } from "@/lib/auth/utils";

export const revalidate = 0;

export default async function ModelsPage() {
  return (
    <main>
      <div className="relative">
        <div className="flex justify-between">
          <h1 className="font-semibold text-2xl my-2">Models</h1>
        </div>
        <Models />
      </div>
    </main>
  );
}

const Models = async () => {
  await checkAuth();

  const { models } = await getModels();
  const { furnitures } = await getFurnitures();
  return (
    <Suspense fallback={<Loading />}>
      <ModelList models={models} furnitures={furnitures} />
    </Suspense>
  );
};
