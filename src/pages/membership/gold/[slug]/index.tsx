"use client";

import MembershipLayout from "@/pages/membership/layout";
import { useParams } from "next/navigation";
import { PortableText } from "@portabletext/react";
import { urlFor } from "@/lib/sanity";
import Image from "next/image";
import { fullItemPage } from "@/lib/interface";
import { getSlugData } from "@/lib/itemsData";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function GoldItem() {
  const params = useParams<{ slug: string }>();
  const [slugData, setSlugData] = useState<fullItemPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState("1");

  useEffect(() => {
    async function getData() {
      if (!params) {
        return;
      }

      const data: fullItemPage = await getSlugData(params.slug);
      if (data) {
        setSlugData(data);
      }
      setLoading(false);
    }
    getData();
  }, [params]);

  if (loading) {
    return (
      <MembershipLayout>
        <div>
          <Loader2 className="animate-spin" />
        </div>
      </MembershipLayout>
    );
  }

  if (!slugData) {
    return (
      <MembershipLayout>
        <div>
          <p>{params.slug} not found.</p>
        </div>
      </MembershipLayout>
    );
  }

  const handleAddToCart = () => {
    console.log(`Adding ${count} of ${slugData.title} to cart.`);
  };

  return (
    <MembershipLayout>
      <div className="border p-5 rounded-md">
        <div className="flex flex-col items-center">
          <h1 className="font-bold text-3xl">{slugData.title}</h1>
          <Image
            src={urlFor(slugData.image).url()}
            width={250}
            height={250}
            alt={slugData.title}
          />
        </div>

        <div className="grid gap-4">
          <div className="prose-blue prose-lg dark:prose-invert prose-li:marker:text-primary prose-a:text-primary">
            <PortableText value={slugData.content} />
          </div>
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <Button
                className="p-2 text-white rounded-r-none w-[30px]"
                onClick={() => {
                  if (Number(count) > 1) {
                    setCount(String(Number(count) - 1));
                  }
                }}
              >
                -
              </Button>
              <Input
                type="text"
                value={count}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*$/.test(value)) {
                    setCount(
                      value === "" ? "" : Math.max(1, Number(value)).toString()
                    );
                  }
                }}
                className="text-center w-[50px] rounded-none"
              />
              <Button
                className="p-2 text-white rounded-l-none w-[30px]"
                onClick={() => {
                  setCount(String(Number(count) + 1));
                }}
              >
                +
              </Button>
            </div>
            <Button className="text-white" onClick={handleAddToCart}>
              Add to cart
            </Button>
          </div>
        </div>
      </div>
    </MembershipLayout>
  );
}
