import { checkAuth } from "@/lib/auth/utils";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { ClerkProvider } from "@clerk/nextjs";
import Navbar2 from "@/components/Navbar2";
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await checkAuth();
  return (
    <main>
      <ClerkProvider>
        <div className="flex h-screen">
          {/* <Sidebar /> */}
          <Navbar2 />
          <main className="flex-1 md:p-8 pt-2 p-4 sm:p-8 overflow-y-auto mt-20">
            {children}
          </main>
        </div>
      </ClerkProvider>

      <Toaster richColors />
    </main>
  );
}
