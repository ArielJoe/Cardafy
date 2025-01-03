import { useEffect, useState } from "react";
import { useWallet } from "@meshsdk/react";
import { useRouter } from "next/router";
import { getWallet } from "@/lib/auth";

export const useMerchantVerification = () => {
  const router = useRouter();
  const { wallet, connect } = useWallet();
  const [loading, setLoading] = useState(true);
  const [isMerchant, setIsMerchant] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);

  const merchantAddr = process.env.NEXT_PUBLIC_MERCHANT_ADDRESS;

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        const selectedWalletString = getWallet();
        if (!selectedWalletString) {
          setLoading(false);
          router.push("/");
          return;
        }

        const selectedWallet = JSON.parse(selectedWalletString);
        await connect(selectedWallet.name);
        setWalletConnected(true);
      } catch (error) {
        console.log(error);
        setLoading(false);
        router.push("/");
      }
    };

    fetchWalletData();
  }, []);

  useEffect(() => {
    const checkMerchantStatus = async () => {
      if (!walletConnected || !wallet) return;

      try {
        const addr = await wallet.getChangeAddress();
        if (addr === merchantAddr) {
          setIsMerchant(true);
        } else {
          router.push("/");
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    checkMerchantStatus();
  }, [wallet, walletConnected]);

  return { loading, isMerchant, walletConnected };
};
