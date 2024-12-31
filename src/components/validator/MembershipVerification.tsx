"use client";

import { ReactNode, useEffect, useState } from "react";
import { useWallet } from "@meshsdk/react";
import { getToken } from "@/lib/getToken";
import Verifying from "../state/Verifying";
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

interface MembershipVerificationProps {
  membershipType: "gold" | "silver" | "platinum";
  onVerificationComplete: (hasMembership: boolean) => void;
  children: ReactNode;
}

const gold = getToken().gold;
const silver = getToken().silver;
const platinum = getToken().platinum;

const MembershipVerification: React.FC<MembershipVerificationProps> = ({
  membershipType,
  onVerificationComplete,
  children,
}) => {
  const { wallet, connected } = useWallet();
  const [loadingUser, setLoadingUser] = useState(true);

  const fetchAndValidateAssets = async () => {
    if (connected) {
      try {
        const _assets = await wallet.getAssets();
        const tokens = getToken();
        const filteredAsset = _assets.filter(
          (item) => item.assetName === tokens[membershipType]
        );
        const hasMembershipStatus = filteredAsset.length > 0;
        onVerificationComplete(hasMembershipStatus);
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
    } else {
      setLoadingUser(false);
    }
  };

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
        onVerificationComplete(storedHasMembership);
        setLoadingUser(false);
      } else {
        await fetchAndValidateAssets();
      }
    };

    fetchData();
  }, [membershipType, connected, onVerificationComplete]);

  useEffect(() => {
    fetchAndValidateAssets();
  }, [connected]);

  if (loadingUser) {
    return <Verifying />;
  }

  return <>{children}</>;
};

export default MembershipVerification;
