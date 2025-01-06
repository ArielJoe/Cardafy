import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/dashboard/AppSidebar";
import { ModeToggle } from "@/components/ui/ModeToggle";
import Chatbot from "../../components/Chatbot";
import OnChain from "@/components/OnChain";

export default function MembershipLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div>
      <div className="fixed bottom-5 right-5">
        <div className="flex items-center gap-4 z-50">
          <OnChain />
          <ModeToggle />
          <Chatbot />
        </div>
      </div>
      <SidebarProvider>
        <AppSidebar />
        <main className="w-full">
          <SidebarTrigger />
          <div className="mx-8 mt-1 mb-8">{children}</div>
        </main>
      </SidebarProvider>
    </div>
  );
}
