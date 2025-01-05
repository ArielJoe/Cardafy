"use client";

import { useEffect, useState } from "react";
import { getToken } from "@/lib/getToken";
import { useWallet } from "@meshsdk/react";
import router from "next/router";
import MembershipLayout from "@/pages/membership/layout";
import { urlFor } from "@/lib/sanity/sanity";
import { itemCard } from "@/lib/sanity/interface";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { getItemsData } from "@/lib/sanity/itemsData";
import Verifying from "@/components/state/Verifying";
import NoAccess from "@/components/state/NoAccess";
import {
  getHasGold,
  getHasPlatinum,
  getHasSilver,
  removeHasGold,
  removeHasPlatinum,
  removeHasSilver,
  setHasGold,
  setHasPlatinum,
  setHasSilver,
} from "@/lib/auth";

type MembershipType = "gold" | "silver" | "platinum";

interface MembershipPageProps {
  membershipType: MembershipType;
}

const gold = getToken().gold;
const silver = getToken().silver;
const platinum = getToken().platinum;

const MembershipPage: React.FC<MembershipPageProps> = ({ membershipType }) => {
  const { wallet, connected } = useWallet();
  const [hasMembership, setHasMembership] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingItems, setLoadingItems] = useState(true);
  const [items, setItems] = useState<itemCard[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchData = async () => {
      const storedHasMembership = (() => {
        switch (membershipType) {
          case "gold":
            return getHasGold();
          case "platinum":
            return getHasPlatinum();
          case "silver":
            return getHasSilver();
        }
      })();

      if (storedHasMembership) {
        setHasMembership(storedHasMembership !== null);
        setLoadingUser(false);
      } else {
        await fetchAndValidateAssets();
      }
    };

    fetchData();
  }, [membershipType]);

  useEffect(() => {
    if (!loadingUser && !hasMembership) {
      router.push("/login");
    }
  }, [loadingUser, hasMembership]);

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

  useEffect(() => {
    const validateAssetsOnWalletChange = async () => {
      await fetchAndValidateAssets();
    };

    validateAssetsOnWalletChange();
  }, [connected]);

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
      const tokens = getToken();
      const filteredAsset = _assets.filter(
        (item) => item.assetName === tokens[membershipType]
      );
      const hasMembershipStatus = filteredAsset.length > 0;
      setHasMembership(hasMembershipStatus);

      if (hasMembershipStatus) {
        const memberships = {
          gold: _assets.some(
            (asset: { assetName: string | undefined }) =>
              asset.assetName === gold
          ),
          platinum: _assets.some(
            (asset: { assetName: string | undefined }) =>
              asset.assetName === platinum
          ),
          silver: _assets.some(
            (asset: { assetName: string | undefined }) =>
              asset.assetName === silver
          ),
        };

        if (memberships.gold) {
          setHasGold();
        } else {
          removeHasGold();
        }
        if (memberships.platinum) {
          setHasPlatinum();
        } else {
          removeHasPlatinum();
        }
        if (memberships.silver) {
          setHasSilver();
        } else {
          removeHasSilver();
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingUser(false);
    }
  };

  if (loadingUser) {
    return <Verifying />;
  }

  if (!hasMembership) {
    return <NoAccess />;
  }

  const membershipItems = items.filter(
    (item) =>
      item.membership ===
      membershipType.charAt(0).toUpperCase() + membershipType.slice(1)
  );

  const filteredItems = membershipItems.filter((item) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, endIndex);

  return (
    <MembershipLayout>
      <div className="flex flex-col gap-5">
        <Navbar
          title={`${membershipType.charAt(0).toUpperCase() + membershipType.slice(1)} Membership`}
        />
        <div className="flex items-center border px-3 rounded-md w-fit">
          <Search />
          <input
            type="text"
            placeholder="Search by item name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border p-2 rounded-md border-none focus:outline-none bg-transparent"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
          {!loadingItems ? (
            paginatedItems.length > 0 ? (
              paginatedItems.map((item, idx) => (
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
                    <div className="grid gap-2">
                      <h1 className="text-xl font-bold text-center line-clamp-2">
                        {item.title}
                      </h1>
                      <p className="text-base text-left line-clamp-3">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-2 text-center mt-1">
                    <div className="font-bold">
                      ₳&nbsp;&nbsp;
                      {item.price}
                    </div>
                    <Button className="p-0">
                      <Link
                        href={`/membership/${membershipType}/${item.slug}`}
                        className="text-white flex justify-center items-center w-full h-full font-semibold"
                      >
                        See Details
                      </Link>
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full flex justify-center items-center">
                <p className="text-xl">No Items Found</p>
              </div>
            )
          ) : (
            <div className="col-span-full flex justify-center items-center">
              <Loader2 className="animate-spin" size={40} />
            </div>
          )}
        </div>
        {paginatedItems.length !== 0 && (
          <div className="flex justify-center items-center gap-4">
            <Button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="border size-10 rounded-md"
            >
              <ChevronLeft color="white" />
            </Button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <Button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="border size-10 rounded-md"
            >
              <ChevronRight color="white" />
            </Button>
          </div>
        )}
      </div>
    </MembershipLayout>
  );
};

export default MembershipPage;
