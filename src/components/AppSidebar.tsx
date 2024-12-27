"use client";

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
import { Gem, Info, ShoppingCart } from "lucide-react";
import { useWallet } from "@meshsdk/react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

const links = [
  { id: 0, title: "Membership", url: "", icon: <Gem size={20} /> },
  {
    id: 1,
    title: "Silver",
    url: "/membership/silver",
    icon: <span className="p-2 bg-[#c4c4c4] rounded-full" />,
  },
  {
    id: 2,
    title: "Gold",
    url: "/membership/gold",
    icon: <span className="p-2 bg-[#efbf04] rounded-full" />,
  },
  {
    id: 3,
    title: "Platinum",
    url: "/membership/platinum",
    icon: <span className="p-2 bg-[#d9d9d9] rounded-full" />,
  },
  { id: 4, title: "Cart", url: "/membership/cart", icon: <ShoppingCart /> },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const { wallet, connect, disconnect } = useWallet();
  const [adaBalance, setAdaBalance] = useState(0);
  const [walletAddress, setWalletAddress] = useState("");
  const [network, setNetwork] = useState("");
  const [hasGold, setHasGold] = useState(false);
  const [hasSilver, setHasSilver] = useState(false);
  const [hasPlatinum, setHasPlatinum] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchWalletData = async () => {
      const selectedWalletString = localStorage.getItem("selectedWallet");
      if (selectedWalletString) {
        const selectedWallet = JSON.parse(selectedWalletString);
        await connect(selectedWallet.name);

        if (wallet) {
          try {
            const addr = await wallet.getChangeAddress();
            setWalletAddress(addr);
            const lovelace = await wallet.getLovelace();
            setAdaBalance(parseInt(lovelace) / 1000000);
            const net = await wallet.getNetworkId();
            setNetwork(
              net === 1 ? "Mainnet" : net === 0 ? "Testnet" : "Offline"
            );
          } catch (error) {
            console.log(error);
          }
        }
      }
    };

    fetchWalletData();
  }, [connect, wallet]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setHasGold(localStorage.getItem("hasGold") === "true");
      setHasSilver(localStorage.getItem("hasSilver") === "true");
      setHasPlatinum(localStorage.getItem("hasPlatinum") === "true");
    }
  }, []);

  const handleDisconnect = () => {
    localStorage.removeItem("selectedWallet");
    localStorage.removeItem("hasGold");
    localStorage.removeItem("hasSilver");
    localStorage.removeItem("hasPlatinum");
    disconnect();
  };

  return (
    <Sidebar>
      <SidebarContent className="dark:bg-[#020817] light:bg-white">
        <SidebarGroup>
          <SidebarGroupLabel className="w-full mt-2 text-black text-3xl font-bold light:text-black dark:text-white">
            <Link href={"/"}>Cardafy</Link>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="py-4">
              <Separator className="light:bg-black dark:bg-white" />
              <div className="py-4">
                {links.map((link) => {
                  if (
                    (link.title === "Gold" && !hasGold) ||
                    (link.title === "Silver" && !hasSilver) ||
                    (link.title === "Platinum" && !hasPlatinum)
                  ) {
                    return null;
                  }

                  return (
                    <Link
                      className={cn(
                        pathname === link.url
                          ? "text-primary bg-primary/10 rounded-md"
                          : "text-muted-foreground hover:text-foreground",
                        link.id !== 0 && link.id != 4
                          ? "ml-8 mr-2 w-auto"
                          : null,
                        "flex items-center gap-3 rounded-lg p-3 transition-all hover:text-primary text-lg"
                      )}
                      key={link.id}
                      href={link.url}
                    >
                      {link.icon}
                      {link.title}
                    </Link>
                  );
                })}
              </div>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="dark:bg-[#020817] light:bg-white">
        <div className="p-2">
          <div className="flex justify-end gap-3 w-full">
            <button
              className="border border-red-500 rounded-sm hover:bg-red-500 hover:text-white p-1 flex-grow h-10"
              onClick={() => {
                handleDisconnect();
                router.push("/login");
              }}
            >
              Sign out
            </button>
            <Sheet>
              <SheetTrigger>
                <div className="border bg-transparent rounded-md p-2 w-10 h-10 flex justify-center items-center">
                  <Info className="text-black dark:text-white" width={25} />
                </div>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle className="text-3xl font-bold">
                    Wallet Info
                  </SheetTitle>
                  <div>
                    <div className="border-t pt-3">
                      <div className="pb-3">
                        <p>Wallet Address :</p>
                        <div className="break-words overflow-wrap relative w-full">
                          <p className="whitespace-normal">{walletAddress}</p>
                        </div>
                      </div>
                    </div>
                    <div className="border-t pt-3">
                      <div className="pb-3">
                        <p>Network :</p>
                        <p>
                          <p>{network}</p>
                        </p>
                      </div>
                    </div>
                    <div className="border-t pt-3">
                      <div className="pb-3">
                        <p>Balance :</p>
                        <p>
                          <span className="font-bold">₳</span> {adaBalance}
                        </p>
                      </div>
                    </div>
                  </div>
                </SheetHeader>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
