"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NoAccess() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/login");
    }, 1000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex justify-center items-center h-screen">
      <p className="text-lg sm:text-2xl text-center font-bold">
        You don't have access to this page
      </p>
    </div>
  );
}
