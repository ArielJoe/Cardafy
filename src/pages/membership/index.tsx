import Verifying from "@/components/Verifying";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function MembershipPage() {
  const router = useRouter();

  useEffect(() => {
    if (localStorage.getItem("hasSilver")) {
      router.push("/membership/silver");
    } else if (localStorage.getItem("hasGold")) {
      router.push("/membership/gold");
    } else if (localStorage.getItem("hasPlatinum")) {
      router.push("/membership/Platinum");
    } else {
      router.push("/login");
    }
  }, []);

  return <Verifying />;
}
