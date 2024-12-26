"use client";

import { useWallet } from "@meshsdk/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Verifying from "@/components/Verifying";
import NoAccess from "@/components/NoAccess";
import Navbar from "@/components/Navbar";
import { ModeToggle } from "@/components/ui/ModeToggle";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, LogIn, House } from "lucide-react";

const merchantAddr = process.env.NEXT_PUBLIC_MERCHANT_ADDRESS;

export default function Merchant() {
  const router = useRouter();
  const { wallet, connect, disconnect } = useWallet();
  const [loading, setLoading] = useState(true);
  const [isMerchant, setIsMerchant] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);

  const handleLogOutClick = () => {
    localStorage.removeItem("selectedWallet");
    disconnect();
    router.push("/login");
  };

  const handleHomeClick = () => {
    router.push("/");
  };

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        const selectedWalletString = localStorage.getItem("selectedWallet");
        if (!selectedWalletString) {
          setLoading(false);
          router.push("/");
          return;
        }

        const selectedWallet = JSON.parse(selectedWalletString);
        await connect(selectedWallet.name);
        setWalletConnected(true);
      } catch (error) {
        console.error("Error connecting wallet:", error);
        setLoading(false);
        router.push("/");
      }
    };

    fetchWalletData();
  }, [connect, router]);

  useEffect(() => {
    const checkMerchantStatus = async () => {
      if (!walletConnected || !wallet) return;

      try {
        const addr = await wallet.getChangeAddress();
        if (addr === merchantAddr) {
          setIsMerchant(true);
        } else {
          router.push("/");
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    checkMerchantStatus();
  }, [wallet, walletConnected, router]);

  if (loading) {
    return <Verifying />;
  }

  if (walletConnected && !isMerchant) {
    return <NoAccess />;
  }

  return (
    <div>
      <div className="fixed bottom-5 right-5">
        <HoverCard openDelay={0} onOpenChange={setIsHovered}>
          <HoverCardTrigger asChild>
            <Button variant="outline" className="h-14 w-14 rounded-full">
              {isHovered ? (
                <ChevronUp strokeWidth={3} />
              ) : (
                <ChevronDown strokeWidth={3} />
              )}
            </Button>
          </HoverCardTrigger>
          <HoverCardContent className="w-auto p-2 border-none mb-2">
            <div className="flex flex-col items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-full"
                onClick={handleHomeClick}
              >
                <House />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-full"
                onClick={handleLogOutClick}
              >
                <LogIn />
              </Button>
              <ModeToggle />
            </div>
          </HoverCardContent>
        </HoverCard>
      </div>
      <div className="m-8 pb-4 border-b">
        <Navbar title="Orders" />
      </div>
    </div>
  );
}
