import * as React from "react";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

const items = [
  "/items/Black around the clock.webp",
  "/items/Cardano Cap.webp",
  "/items/Genesis T-Shirt.webp",
  "/items/Mug.webp",
  "/items/Swim Trunks.webp",
];

export default function ItemsCarousel() {
  const plugin = React.useRef(
    Autoplay({ delay: 2000, stopOnInteraction: true })
  );

  return (
    <Carousel
      plugins={[plugin.current]}
      className="w-full max-w-xs"
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.reset}
    >
      <CarouselContent>
        {items.map((item, index) => (
          <CarouselItem key={index} className="h-[500px] flex items-center">
            <HoverCard>
              <HoverCardTrigger>
                <div className="image-container">
                  <Image src={item} alt={item} width={500} height={500} />
                </div>
              </HoverCardTrigger>
              <HoverCardContent className="mt-5">
                {item.split("/")[2].split(".")[0]}
              </HoverCardContent>
            </HoverCard>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
