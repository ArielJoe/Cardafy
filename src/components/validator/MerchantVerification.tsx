import { ReactNode } from "react";
import { useMerchantVerification } from "@/hooks/useMerchantVerification";
import Verifying from "@/components/state/Verifying";
import NoAccess from "@/components/state/NoAccess";

interface MerchantVerificationProps {
  children: ReactNode;
}

export const MerchantVerification = ({
  children,
}: MerchantVerificationProps) => {
  const { loading, isMerchant } = useMerchantVerification();

  if (loading) {
    return <Verifying />;
  }

  if (!isMerchant) {
    return <NoAccess />;
  }

  return <>{children}</>;
};
