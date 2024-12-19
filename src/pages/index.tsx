import AnimatedGridPattern from "@/components/ui/animated-grid-pattern";
import { cn } from "@/lib/utils";
import { useRouter } from "next/router";
import ShimmerButton from "@/components/ui/shimmer-button";
import ItemsCarousel from "@/components/Carousel";
import AccordionSection from "@/components/Accordion";
import { ModeToggle } from "@/components/ui/ModeToggle";
import Benefits from "@/components/Benefits";
import { useRef } from "react";
import { ChevronDown } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const benefitsRef = useRef<HTMLDivElement>(null);

  const scrollToBenefits = () => {
    if (benefitsRef.current) {
      benefitsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div>
      <div className="absolute top-5 left-5">
        <ModeToggle />
      </div>
      <div className="h-screen flex items-center justify-center p-4">
        <div>
          <div className="flex gap-20 items-center">
            <ItemsCarousel />
            <div className="flex flex-col gap-5">
              <h1 className="font-bold text-5xl">Cardafy</h1>
              <p className="text-xl">
                Secure Transactions with Smart Contracts.
              </p>
              <ShimmerButton
                className="w-fit"
                onClick={() => {
                  if (localStorage.getItem("selectedWallet") !== null) {
                    router.push("/membership");
                  } else {
                    router.push("/login");
                  }
                }}
              >
                <span className="text-white">Shop Now</span>
              </ShimmerButton>
            </div>
          </div>
        </div>
        <AnimatedGridPattern
          numSquares={30}
          maxOpacity={0.1}
          duration={1}
          repeatDelay={1}
          className={cn(
            "[mask-image:radial-gradient(500px_circle_at_center,white,transparent)]",
            "absolute inset-0 skew-y-12 z-[-1]"
          )}
        />
      </div>
      <button
        onClick={scrollToBenefits}
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 py-2 px-4 rounded-full shadow-lg transition border text-white"
      >
        <ChevronDown className="float" />
      </button>
      <div ref={benefitsRef}>
        <Benefits />
      </div>
      <AccordionSection />
    </div>
  );
}
