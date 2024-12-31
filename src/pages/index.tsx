"use client";

import AnimatedGridPattern from "@/components/ui/animated-grid-pattern";
import { cn } from "@/lib/utils";
import { useRouter } from "next/router";
import ItemsCarousel from "@/components/home/Carousel";
import AccordionSection from "@/components/home/Accordion";
import { ModeToggle } from "@/components/ui/ModeToggle";
import Benefits from "@/components/home/Benefits";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { RainbowButton } from "@/components/ui/rainbow-button";
import Chatbot from "../components/Chatbot";
import PulsatingButton from "@/components/ui/pulsating-button";
import { useWallet } from "@meshsdk/react";
import Link from "next/link";
import { getWallet } from "@/lib/auth";

const merchantAddr = process.env.NEXT_PUBLIC_MERCHANT_ADDRESS;

export default function Home() {
  const router = useRouter();
  const benefitsRef = useRef<HTMLDivElement>(null);
  const { wallet, connect } = useWallet();
  const [role, setRole] = useState("");

  useEffect(() => {
    const fetchWalletData = async () => {
      const selectedWalletString = getWallet();
      if (selectedWalletString) {
        const selectedWallet = JSON.parse(selectedWalletString);
        await connect(selectedWallet.name);

        if (wallet) {
          try {
            const addr = await wallet.getChangeAddress();
            if (addr !== merchantAddr) {
              setRole("customer");
            } else {
              setRole("merchant");
            }
          } catch (error) {
            console.log(error);
          }
        }
      }
    };

    fetchWalletData();
  }, [connect, wallet]);

  const scrollToBenefits = () => {
    if (benefitsRef.current) {
      benefitsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  function pulsatingButton(text: string, href: string) {
    return (
      <Link href={href}>
        <PulsatingButton pulseColor="white">
          <p className="text-white font-semibold">{text}</p>
        </PulsatingButton>
      </Link>
    );
  }

  return (
    <div>
      <div className="fixed top-5 left-5">
        <ModeToggle />
      </div>
      <div className="fixed bottom-5 right-5">
        <Chatbot />
      </div>
      <div className="fixed top-5 right-5">
        {role === "customer"
          ? pulsatingButton("Continue buying", "/membership")
          : role === "merchant"
            ? pulsatingButton("See orders", "/merchant")
            : null}
      </div>

      <div className="h-screen flex items-center justify-center p-4">
        <div className="flex gap-5 sm:gap-20 items-center p-4">
          <ItemsCarousel />
          <div className="flex flex-col gap-5">
            <h1 className="font-bold text-5xl text-primary">Cardafy</h1>
            <p className="text-xl">Secure Transactions with Smart Contracts.</p>
            <RainbowButton
              className="w-fit rounded-full z-[1]"
              onClick={() => {
                if (getWallet() !== null) {
                  router.push("/membership");
                } else {
                  router.push("/login");
                }
              }}
            >
              <span className="font-bold">Shop Now</span>
            </RainbowButton>
          </div>
        </div>
        <AnimatedGridPattern
          numSquares={30}
          maxOpacity={0.1}
          duration={1}
          repeatDelay={1}
          className={cn(
            "[mask-image:radial-gradient(500px_circle_at_center,white,transparent)]",
            "absolute inset-0 skew-y-12 z-[-2]"
          )}
        />
      </div>
      <button
        onClick={scrollToBenefits}
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 py-2 px-4 rounded-full shadow-lg transition border text-white"
      >
        <ChevronDown className="float text-black dark:text-white" />
      </button>
      <div ref={benefitsRef}>
        <Benefits />
      </div>
      <AccordionSection />
    </div>
  );
}
