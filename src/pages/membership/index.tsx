import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function MembershipPage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/membership/gold");
  }, []);
}
