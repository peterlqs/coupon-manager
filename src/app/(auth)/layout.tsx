import { getUserAuth } from "@/lib/auth/utils";
import { redirect } from "next/navigation";
import { ClerkProvider } from "@clerk/nextjs";
import Navbar2 from "@/components/Navbar2";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getUserAuth();
  if (session?.session) redirect("/coupons");

  return (
    <div className="bg-muted h-screen pt-8">
      <ClerkProvider>{children}</ClerkProvider>
    </div>
  );
}
