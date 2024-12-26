"use client";

import { useState, useEffect } from "react";
import { useWallet, useWalletList } from "@meshsdk/react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import router from "next/router";
import { getToken } from "@/lib/getToken";
import { Loader2 } from "lucide-react";

interface Wallet {
  name: string;
  icon: string;
}

const gold = getToken().gold;
const silver = getToken().silver;
const platinum = getToken().platinum;
const merchantAddr = process.env.NEXT_PUBLIC_MERCHANT_ADDRESS;

const ConnectWallet = () => {
  const { toast } = useToast();
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const { wallet, connect, disconnect, connecting, connected } = useWallet();
  const wallets: Wallet[] = useWalletList();
  const [assetsList, setAssetsList] = useState([
    { assetName: "", fingerPrint: "", policyId: "", quantity: "", unit: "" },
  ]);
  const [loadingNft, setLoadingNft] = useState(false);
  const [loadingWallet, setLoadingWallet] = useState(false);
  const [isMerchant, setIsMerchant] = useState(false);

  useEffect(() => {
    const fetchWalletData = async () => {
      clearStates();
      setLoadingWallet(true);
      const storedWallet = localStorage.getItem("selectedWallet");
      if (storedWallet) {
        const parsedWallet: Wallet = JSON.parse(storedWallet);
        setSelectedWallet(parsedWallet);
        await connect(parsedWallet.name);
      }
      setLoadingWallet(false);
    };

    fetchWalletData();
  }, []);

  useEffect(() => {
    const checkMerchantStatus = async () => {
      if (wallet && connected) {
        try {
          const addr = await wallet.getChangeAddress();
          if (addr === merchantAddr) {
            setIsMerchant(true);
            toast({
              className: "bg-primary font-semibold",
              description: `Welcome, Merchant!`,
            });
            return true;
          }
          return false;
        } catch (error) {
          console.log(error);
          return false;
        }
      }
      return false;
    };

    const init = async () => {
      if (wallet && connected && !loadingWallet) {
        const isMerchantWallet = await checkMerchantStatus();
        if (!isMerchantWallet) {
          checkNftCredentials();
        }
      }
    };

    init();
  }, [wallet, connected, loadingWallet]);

  function clearStates() {
    setAssetsList([
      { assetName: "", fingerPrint: "", policyId: "", quantity: "", unit: "" },
    ]);
    setIsMerchant(false);
  }

  async function checkNftCredentials() {
    if (isMerchant) return;

    setLoadingNft(true);
    try {
      if (wallet) {
        const _assets = await wallet.getAssets();
        console.log("ASSETS:", _assets);

        const filteredAsset: any = _assets.filter(
          (asset: { assetName: string; policyId: string }) =>
            asset.assetName === gold ||
            asset.assetName === silver ||
            asset.assetName === platinum
        );

        setAssetsList(filteredAsset);

        if (filteredAsset.length === 0) {
          toast({
            variant: "destructive",
            title: "No NFTs Detected",
            description: `Can't sign in without NFT!`,
          });
        } else {
          const memberships = {
            gold: filteredAsset.some(
              (asset: { assetName: string | undefined }) =>
                asset.assetName === gold
            ),
            platinum: filteredAsset.some(
              (asset: { assetName: string | undefined }) =>
                asset.assetName === platinum
            ),
            silver: filteredAsset.some(
              (asset: { assetName: string | undefined }) =>
                asset.assetName === silver
            ),
          };

          let description = "Memberships you can use: ";
          if (memberships.gold) {
            description += "Gold\n";
            localStorage.setItem("hasGold", "true");
          }
          if (memberships.platinum) {
            description += "Platinum\n";
            localStorage.setItem("hasPlatinum", "true");
          }
          if (memberships.silver) {
            description += "Silver\n";
            localStorage.setItem("hasSilver", "true");
          }

          toast({
            className: "bg-green-900 text-white",
            title: `${filteredAsset.length} NFTs Detected`,
            description: description,
          });
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingNft(false);
    }
  }

  const handleWalletSelection = (wallet: Wallet) => {
    localStorage.setItem("selectedWallet", JSON.stringify(wallet));
    setSelectedWallet(wallet);
    connect(wallet.name);
  };

  const handleDisconnect = () => {
    localStorage.removeItem("selectedWallet");
    localStorage.removeItem("hasGold");
    localStorage.removeItem("hasSilver");
    localStorage.removeItem("hasPlatinum");
    disconnect();
    setSelectedWallet(null);
    clearStates();
    toast({
      description: `Signed out`,
    });
  };

  function loginHandler(assetName: string) {
    const memberToken = assetName;
    if (memberToken === silver) {
      router.push("/membership/silver");
    } else if (memberToken === gold) {
      router.push("/membership/gold");
    } else if (memberToken === platinum) {
      router.push("/membership/platinum");
    }
  }

  return (
    <div>
      <div>
        {selectedWallet && !connecting ? (
          <div className="grid gap-3">
            {loadingNft ? (
              <div className="flex items-center justify-center">
                <Loader2 className="size-4 mr-2 animate-spin" />
                <p>Getting available NFTs...</p>
              </div>
            ) : isMerchant ? (
              <button
                className="p-2 w-full rounded-sm bg-primary"
                onClick={() => {
                  router.push("/merchant");
                }}
              >
                <p className="text-white">Sign in as Merchant</p>
              </button>
            ) : (
              assetsList.map((asset, index) => (
                <div key={index}>
                  {asset && (
                    <button
                      className={`p-2 w-full rounded-sm ${
                        asset.assetName === silver
                          ? "bg-[#c4c4c4]"
                          : asset.assetName === gold
                            ? "bg-[#efbf04]"
                            : asset.assetName === platinum
                              ? "bg-[#d9d9d9]"
                              : null
                      }`}
                      onClick={() => {
                        loginHandler(asset.assetName);
                      }}
                    >
                      <p className="text-black">
                        {asset.assetName === silver
                          ? "Sign in as Silver Member"
                          : asset.assetName === gold
                            ? "Sign in as Gold Member"
                            : asset.assetName === platinum
                              ? "Sign in as Platinum Member"
                              : null}
                      </p>
                    </button>
                  )}
                </div>
              ))
            )}
            <button
              className="border border-red-500 rounded-sm hover:bg-red-500 p-1"
              onClick={handleDisconnect}
            >
              Sign out
            </button>
          </div>
        ) : wallets.length > 0 ? (
          <p className="text-center">Please select your available wallets :</p>
        ) : (
          <p className="text-center">No wallet detected.</p>
        )}
      </div>
      <div className="flex justify-center">
        {!selectedWallet && !connecting && (
          <ul className="flex gap-3 mt-3">
            {wallets.map((w) => (
              <li
                key={w.name}
                onClick={() => {
                  handleWalletSelection(w);
                }}
                className="hover:cursor-pointer hover:bg-primary hover:text-secondary hover:rounded-sm"
              >
                <div className="border border-primary rounded-sm p-2 h-full grid items-center hover:text-white">
                  <Image src={w.icon} alt={w.name} width={50} height={50} />
                  <p className="text-center">{w.name}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ConnectWallet;
