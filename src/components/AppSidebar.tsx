import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Separator } from "./ui/separator";
import { LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { useWallet } from "@meshsdk/react";

const links = [
  { id: 0, title: "Membership", url: "" },
  {
    id: 1,
    title: "Gold",
    url: "/membership/gold",
  },
  { id: 2, title: "Silver", url: "/membership/silver" },
  { id: 3, title: "Platinum", url: "/membership/platinum" },
];

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarContent className="dark:bg-[#020817] light:bg-white">
        <SidebarGroup>
          <SidebarGroupLabel className="w-full text-black text-3xl font-bold light:text-black dark:text-white">
            <Link href={"/"}>Cardafy</Link>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="py-4">
              <Separator className="light:bg-black dark:bg-white" />
              <div className="py-4">
                {links.map((link) => (
                  <Link
                    className={cn(
                      pathname === link.url
                        ? "text-primary bg-primary/10 rounded-md"
                        : "text-muted-foreground hover:text-foreground",
                      link.id !== 0 ? "ml-8 w-auto" : null,
                      "flex items-center gap-3 rounded-lg p-3 transition-all hover:text-primary text-base"
                    )}
                    key={link.id}
                    href={link.url}
                  >
                    {link.title}
                  </Link>
                ))}
              </div>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="dark:bg-[#020817] light:bg-white">
        <div className="p-2">
          <Link href={"/login"}>
            <Button className="border bg-transparent">
              <LogOut className="dark:text-white light:text-[#020817]" />
            </Button>
          </Link>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
