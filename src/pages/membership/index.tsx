import Verifying from "@/components/state/Verifying";
import { getHasGold, getHasPlatinum, getHasSilver } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function MembershipPage() {
  const router = useRouter();

  useEffect(() => {
    if (getHasGold()) {
      router.push("/membership/gold");
    } else if (getHasPlatinum()) {
      router.push("/membership/platinum");
    } else if (getHasSilver()) {
      router.push("/membership/silver");
    } else {
      router.push("/login");
    }
  }, []);

  return <Verifying />;
}
