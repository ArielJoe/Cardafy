"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { urlFor } from "@/lib/sanity/sanity";
import { getImageById } from "@/lib/sanity/itemsData";
import { Loader2 } from "lucide-react";

interface CartImageProps {
  imageId: string;
  title: string;
}

export default function CartImage({ imageId, title }: CartImageProps) {
  const [imageUrl, setImageUrl] = useState<string>("");

  useEffect(() => {
    async function loadImage() {
      try {
        const images = await getImageById(imageId);

        if (images && images.length > 0 && images[0].image?.asset?._ref) {
          const imageRef = {
            _type: "image",
            asset: {
              _ref: images[0].image.asset._ref,
              _type: "reference",
            },
          };
          setImageUrl(urlFor(imageRef).url());
        } else {
          console.log("Image structure is not valid:", images);
        }
      } catch (error) {
        console.log(error);
      }
    }

    loadImage();
  }, [imageId]);

  if (!imageUrl) {
    return <Loader2 className="animate-spin" size={30} />;
  }

  return (
    <Image
      src={imageUrl}
      width={150}
      height={150}
      alt={title}
      loading="lazy"
      className="rounded-lg"
    />
  );
}
