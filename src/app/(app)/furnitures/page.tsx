import { Suspense } from "react";

import Loading from "@/app/loading";
import FurnitureList from "@/components/furnitures/FurnitureList";
import { getFurnitures } from "@/lib/api/furnitures/queries";

import { checkAuth } from "@/lib/auth/utils";

export const revalidate = 0;

export default async function FurnituresPage() {
  return (
    <main>
      <div className="relative">
        <div className="flex justify-between">
          <h1 className="font-semibold text-2xl my-2">Furnitures</h1>
        </div>
        <Furnitures />
      </div>
    </main>
  );
}

const Furnitures = async () => {
  await checkAuth();

  const { furnitures } = await getFurnitures();
  
  return (
    <Suspense fallback={<Loading />}>
      <FurnitureList furnitures={furnitures}  />
    </Suspense>
  );
};
