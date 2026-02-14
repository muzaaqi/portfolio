import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/sidebar";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <AdminSidebar user={session.user} />
      <SidebarInset>
        <div className="bg-background min-h-screen p-6 font-sans">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
