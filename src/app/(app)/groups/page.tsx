import { Suspense } from "react";

import Loading from "@/app/loading";
import GroupList from "@/components/groups/GroupList";
import { getGroups } from "@/lib/api/groups/queries";

export const revalidate = 0;

export default async function GroupsPage() {
  return (
    <main>
      <div className="relative">
        <div className="flex justify-between">
          <h1 className="font-semibold text-2xl my-2">Groups</h1>
        </div>
        <Groups />
      </div>
    </main>
  );
}

const Groups = async () => {
  const { groups, couponGroups } = await getGroups();
  // Sort the groups by createdAt descending, the group named Default always first
  groups.sort((a, b) => {
    if (a.name === "Default") return -1;
    if (b.name === "Default") return 1;
    if (a.createdAt && b.createdAt) {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return 0;
  });
  // Filter out null values in couponGroups
  const filteredCG = couponGroups.map((item) => {
    if (item === null)
      return {
        id: "",
        coupon_id: "",
        group_id: "",
      };
    return item;
  });

  return (
    <Suspense fallback={<Loading />}>
      <GroupList groups={groups} couponGroups={filteredCG} />
    </Suspense>
  );
};
