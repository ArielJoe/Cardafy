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

export default function Platinum() {
  const { wallet, connected } = useWallet();
  const [hasPlatinum, setHasPlatinum] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingItems, setLoadingItems] = useState(true);
  const [items, setItems] = useState<itemCard[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const storedHasPlatinum = localStorage.getItem("hasPlatinum");
      if (storedHasPlatinum) {
        setHasPlatinum(JSON.parse(storedHasPlatinum));
        setLoadingUser(false);
      } else {
        await fetchAndValidateAssets();
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!loadingUser && !hasPlatinum) {
      router.push("/login");
    }
  }, [loadingUser, hasPlatinum]);

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
        (item) => item.assetName === getToken().platinum
      );
      const hasPlatinumStatus = filteredAsset.length > 0;
      setHasPlatinum(hasPlatinumStatus);
      localStorage.setItem("hasPlatinum", JSON.stringify(hasPlatinumStatus));
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingUser(false);
    }
  };

  if (loadingUser) {
    return <Verifying />;
  }

  if (!hasPlatinum) {
    return <NoAccess />;
  }

  const platinumItems = items.filter((item) => item.membership === "Platinum");

  return (
    <MembershipLayout>
      <div>
        <Navbar title="Platinum Membership" />
        <div className="py-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {!loadingItems ? (
            platinumItems.length > 0 ? (
              platinumItems.map((item, idx) => (
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
                        href={`platinum/${item.slug}`}
                        className="text-white flex justify-center items-center w-full h-full"
                      >
                        See Details
                      </Link>
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex justify-center items-center h-full">
                <p className="text-lg">No items found.</p>
              </div>
            )
          ) : (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="animate-spin" />
            </div>
          )}
        </div>
      </div>
    </MembershipLayout>
  );
}
