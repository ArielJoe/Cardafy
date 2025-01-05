"use client";

import MembershipLayout from "@/pages/membership/layout";
import { useParams } from "next/navigation";
import { PortableText } from "@portabletext/react";
import { urlFor } from "@/lib/sanity/sanity";
import Image from "next/image";
import { fullItemPage } from "@/lib/sanity/interface";
import { getSlugData } from "@/lib/sanity/itemsData";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { addToCart } from "@/lib/prisma/cart";
import { useWallet } from "@meshsdk/react";
import { getWallet } from "@/lib/auth";

interface ItemDetailProps {
  membershipType: "gold" | "silver" | "platinum";
}

const ItemDetail: React.FC<ItemDetailProps> = ({ membershipType }) => {
  const params = useParams<{ slug: string }>();
  const { toast } = useToast();
  const { wallet, connect } = useWallet();
  const [slugData, setSlugData] = useState<fullItemPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [wrongItem, setWrongItem] = useState(false);
  const [itemCount, setItemCount] = useState("1");
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  useEffect(() => {
    async function getData() {
      if (!params || !wallet) {
        return;
      }

      if (walletAddress === null) {
        const data: fullItemPage = await getSlugData(params.slug);
        if (data) {
          if (
            data.membership.charAt(0).toLowerCase() +
              data.membership.slice(1) !==
            membershipType
          ) {
            setWrongItem(true);
          }
          setSlugData(data);
          fetchWalletData();
        }
      }
      setLoading(false);
    }

    getData();
  }, [params, wallet]);

  const fetchWalletData = async () => {
    const selectedWalletString = getWallet();
    if (selectedWalletString) {
      const selectedWallet = JSON.parse(selectedWalletString);

      if (wallet && typeof wallet.getChangeAddress === "function") {
        try {
          await connect(selectedWallet.name);
          const addr = await wallet.getChangeAddress();
          setWalletAddress(addr);
        } catch (error) {
          console.log(error);
        }
      }
    }
  };

  const handleAddToCart = async (
    address: string,
    title: string,
    image: string,
    qty: number,
    price: number,
    membership: string,
    slug: string
  ) => {
    try {
      await addToCart({
        address,
        title,
        image: image,
        qty: Number(qty),
        price: price,
        membership,
        slug,
      });

      toast({
        className: "bg-green-900 text-white",
        description: `${title} added to cart successfully`,
      });
    } catch (error) {
      console.error("Error in handleAddToCart:", error);
      toast({
        variant: "destructive",
        description:
          error instanceof Error ? error.message : "Failed to add item to cart",
      });
    }
  };

  if (loading || walletAddress === null) {
    return (
      <MembershipLayout>
        <div className="h-full w-full flex justify-center items-center">
          <Loader2 className="animate-spin" size={40} />
        </div>
      </MembershipLayout>
    );
  }

  if (wrongItem) {
    return (
      <MembershipLayout>
        <div className="h-full w-full flex justify-center items-center">
          <p className="text-xl">
            {params.slug.replace("-", " ")} isn't {membershipType} item
          </p>
        </div>
      </MembershipLayout>
    );
  }

  if (!slugData) {
    return (
      <MembershipLayout>
        <div className="h-full w-full flex justify-center items-center">
          <p className="text-xl">{params.slug} Not Found</p>
        </div>
      </MembershipLayout>
    );
  }

  return (
    <MembershipLayout>
      <div className="h-full flex items-center justify-center">
        <div className="border p-5 rounded-md max-w-4xl w-full">
          <div className="flex flex-col items-center">
            <h1 className="font-bold text-3xl">{slugData.title}</h1>
            <Image
              src={urlFor(slugData.image).url()}
              width={250}
              height={250}
              alt={slugData.title}
              className="my-4"
            />
          </div>

          <div className="grid gap-2">
            <div className="prose-blue prose-lg dark:prose-invert prose-li:marker:text-primary prose-a:text-primary">
              <PortableText value={slugData.content} />
            </div>
            <div className="text-lg font-bold">
              ₳&nbsp;&nbsp;
              {slugData.price}
            </div>
            <p>Qty :</p>
            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-2">
                <Button
                  className="p-2 text-white font-semibold rounded-r-none w-[30px]"
                  onClick={() => {
                    if (Number(itemCount) > 1) {
                      setItemCount(String(Number(itemCount) - 1));
                    }
                  }}
                >
                  -
                </Button>
                <Input
                  type="text"
                  value={itemCount}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d*$/.test(value)) {
                      setItemCount(
                        value === ""
                          ? ""
                          : Math.max(1, Number(value)).toString()
                      );
                    }
                  }}
                  className="text-center w-[50px] rounded-none"
                />
                <Button
                  className="p-2 text-white font-semibold rounded-l-none w-[30px]"
                  onClick={() => {
                    setItemCount(String(Number(itemCount) + 1));
                  }}
                >
                  +
                </Button>
              </div>
              <Button
                className="text-white font-semibold"
                onClick={() =>
                  handleAddToCart(
                    walletAddress!,
                    slugData.title,
                    slugData._id,
                    itemCount as unknown as number,
                    slugData.price,
                    slugData.membership,
                    params.slug
                  )
                }
              >
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MembershipLayout>
  );
};

export default ItemDetail;
