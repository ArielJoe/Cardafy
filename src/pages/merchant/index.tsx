"use client";

import { useWallet } from "@meshsdk/react";
import { useState } from "react";
import { useRouter } from "next/router";
import Navbar from "@/components/Navbar";
import { ModeToggle } from "@/components/ui/ModeToggle";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, LogIn, SlidersHorizontal } from "lucide-react";
import { MerchantVerification } from "@/components/validator/MerchantVerification";
import Orders from "@/components/merchant/Orders";

export default function Merchant() {
  const router = useRouter();
  const { disconnect } = useWallet();
  const [isHovered, setIsHovered] = useState(false);

  const handleLogOutClick = () => {
    localStorage.removeItem("selectedWallet");
    disconnect();
    router.push("/login");
  };

  return (
    <MerchantVerification>
      <div className="fixed bottom-5 right-5 z-50">
        <HoverCard openDelay={0} onOpenChange={setIsHovered}>
          <HoverCardTrigger asChild>
            <Button className="size-14 rounded-full bg-black text-white dark:bg-white dark:text-black dark:hover:bg-black dark:hover:text-white">
              {isHovered ? (
                <ChevronUp strokeWidth={2} className="scale-150" />
              ) : (
                <ChevronDown strokeWidth={2} className="scale-150" />
              )}
            </Button>
          </HoverCardTrigger>
          <HoverCardContent className="w-auto p-2 border-none bg-transparent shadow-none">
            <div className="flex flex-col items-center gap-3">
              <Button
                size="icon"
                className="size-14 rounded-full bg-black text-white dark:bg-white dark:text-black dark:hover:bg-black dark:hover:text-white"
                onClick={handleLogOutClick}
              >
                <LogIn strokeWidth={2} className="scale-150" />
              </Button>
              <Button
                size="icon"
                className="size-14 rounded-full bg-black text-white dark:bg-white dark:text-black dark:hover:bg-black dark:hover:text-white"
                onClick={() => {
                  router.push("/merchant/studio");
                }}
              >
                <SlidersHorizontal strokeWidth={2} className="scale-150" />
              </Button>
            </div>
          </HoverCardContent>
        </HoverCard>
      </div>
      <div className="m-8 grid gap-8">
        <div className="pb-4 border-b flex justify-between">
          <Navbar title="Orders" />
          <ModeToggle />
        </div>
        <Orders />
      </div>
    </MerchantVerification>
  );
}
