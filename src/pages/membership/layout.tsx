import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import { ModeToggle } from "@/components/ui/ModeToggle";

export default function MembershipLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div>
      <div className="absolute top-5 right-5">
        <ModeToggle />
      </div>
      <SidebarProvider>
        <AppSidebar />
        <main>
          <SidebarTrigger />
          {children}
        </main>
      </SidebarProvider>
    </div>
  );
}
