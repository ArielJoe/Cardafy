"use client";

import { useEffect, useState } from "react";
import { getToken } from "@/lib/getToken";
import { useWallet } from "@meshsdk/react";
import router from "next/router";
import MembershipLayout from "../layout";
import { urlFor } from "@/lib/sanity";
import { itemCard } from "@/lib/interface";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { getItemsData } from "@/lib/itemsData";
import Verifying from "@/components/Verifying";
import NoAccess from "@/components/NoAccess";

export default function Silver() {
  const { wallet, connected } = useWallet();
  const [hasSilver, setHasSilver] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingItems, setLoadingItems] = useState(true);
  const [items, setItems] = useState<itemCard[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const storedHasSilver = localStorage.getItem("hasSilver");
      if (storedHasSilver) {
        setHasSilver(JSON.parse(storedHasSilver));
        setLoadingUser(false);
      } else {
        await fetchAndValidateAssets();
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!loadingUser && !hasSilver) {
      router.push("/login");
    }
  }, [loadingUser, hasSilver]);

  useEffect(() => {
    const fetchItemsData = async () => {
      try {
        const itemsData = await getItemsData();
        setItems(itemsData);
      } catch (error) {
        console.log(error);
      } finally {
        setLoadingItems(false);
      }
    };

    fetchItemsData();
  }, []);

  const fetchAndValidateAssets = async () => {
    if (connected) {
      await fetchAssets();
    } else {
      setLoadingUser(false);
    }
  };

  const fetchAssets = async () => {
    try {
      const _assets = await wallet.getAssets();
      const filteredAsset = _assets.filter(
        (item) => item.assetName === getToken().silver
      );
      const hasSilverStatus = filteredAsset.length > 0;
      setHasSilver(hasSilverStatus);
      localStorage.setItem("hasSilver", JSON.stringify(hasSilverStatus));
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingUser(false);
    }
  };

  if (loadingUser) {
    return <Verifying />;
  }

  if (!hasSilver) {
    return <NoAccess />;
  }

  const silverItems = items.filter((item) => item.membership === "Silver");

  return (
    <MembershipLayout>
      <div>
        <Navbar title="Silver Membership" />
        <div className="py-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {!loadingItems ? (
            silverItems.length > 0 ? (
              silverItems.map((item, idx) => (
                <div
                  key={idx}
                  className="border rounded-md p-4 flex flex-col justify-between"
                >
                  <div className="flex flex-col items-center">
                    <Image
                      src={urlFor(item.image).url()}
                      alt={item.image}
                      width={150}
                      height={150}
                      className="p-2"
                    />
                    <div className="grid gap-2 text-center">
                      <h1 className="text-xl font-bold line-clamp-2">
                        {item.title}
                      </h1>
                      <p className="text-base line-clamp-3">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-2 text-center">
                    <p>
                      <span className="font-bold">₳</span> {item.price}
                    </p>
                    <Button className="p-0">
                      <Link
                        href={`silver/${item.slug}`}
                        className="text-white flex justify-center items-center w-full h-full"
                      >
                        See Details
                      </Link>
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xl font-bold">
                No Items Found
              </p>
            )
          ) : (
            <Loader2
              className="animate-spin absolute top-1/2 left-1/2"
              size={40}
            />
          )}
        </div>
      </div>
    </MembershipLayout>
  );
}
