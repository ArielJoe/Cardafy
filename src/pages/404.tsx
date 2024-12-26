"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MorphingText from "@/components/ui/morphing-text";

const texts = ["404", "Page Not Found"];

export default function Custom404() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [count, setCount] = useState(5);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const timer = setInterval(() => {
      setCount((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isClient]);

  useEffect(() => {
    if (count === 0) {
      router.push("/");
    }
  }, [count, router]);

  if (!isClient) return null;

  return (
    <div className="flex flex-col gap-12 sm:gap-8 justify-center items-center h-screen px-8">
      <MorphingText texts={texts} />
      <p className="text-lg sm:text-xl text-center">
        You will be redirected to the main page in {count >= 0 ? count : 0}{" "}
        seconds...
      </p>
    </div>
  );
}
