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
  "/items/Black Around The Clock.webp",
  "/items/Cardano Cap.webp",
  "/items/Genesis T-Shirt.webp",
  "/items/Cardano Mug.webp",
  "/items/Cardano Swim Trunk.webp",
];

export default function ItemsCarousel() {
  const plugin = React.useRef(
    Autoplay({ delay: 2000, stopOnInteraction: true })
  );

  return (
    <Carousel
      plugins={[plugin.current]}
      className="w-full max-w-xs z-[1]"
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
                <p className="overflow-ellipsis">
                  {item.split("/")[2].split(".")[0]}
                </p>
              </HoverCardContent>
            </HoverCard>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
