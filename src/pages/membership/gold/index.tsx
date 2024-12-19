"use client";

import { useEffect, useState } from "react";
import { getToken } from "@/lib/getToken";
import { useWallet } from "@meshsdk/react";
import router from "next/router";
import MembershipLayout from "../layout";

export default function Gold() {
  const { wallet, connected } = useWallet();
  const [hasGold, setHasGold] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedHasGold = localStorage.getItem("hasGold");
    if (storedHasGold) {
      setHasGold(JSON.parse(storedHasGold));
      setLoading(false);
    } else {
      fetchAndValidateAssets();
    }
  }, []);

  useEffect(() => {
    if (!loading && !hasGold) {
      router.push("/login");
    }
  }, [loading, hasGold]);

  const fetchAndValidateAssets = async () => {
    if (connected) {
      await fetchAssets();
    } else {
      setLoading(false);
    }
  };

  const fetchAssets = async () => {
    try {
      const _assets = await wallet.getAssets();
      const filteredAsset = _assets.filter(
        (item) => item.assetName === getToken().gold
      );
      const hasGoldStatus = filteredAsset.length > 0;
      setHasGold(hasGoldStatus);
      localStorage.setItem("hasGold", JSON.stringify(hasGoldStatus));
    } catch (error) {
      console.error("Error fetching assets:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Verifying...</p>
      </div>
    );
  }

  return (
    hasGold && (
      <MembershipLayout>
        <div className="px-10">
          <h1>Gold</h1>
        </div>
      </MembershipLayout>
    )
  );
}
