import ConnectWallet from "@/components/login/ConnectWallet";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/ModeToggle";
import { useWallet } from "@meshsdk/react";
import { PlugSocketIcon } from "hugeicons-react";
import { House } from "lucide-react";
import { useRouter } from "next/router";

export default function Login() {
  const { connected } = useWallet();
  const router = useRouter();

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="absolute left-5 top-5">
        <ModeToggle />
      </div>
      <div className="flex flex-col gap-3 items-end">
        <Button
          className="w-10 h-10"
          onClick={() => {
            router.push("/");
          }}
        >
          <House className="text-white" />
        </Button>
        <div className="grid gap-3 border p-4 rounded-md">
          <h1 className="text-3xl text-center border-b border-white pb-3">
            Welcome to <span className="font-bold">Cardafy</span>!
          </h1>
          <ConnectWallet />
        </div>
      </div>
      <div className="absolute right-5 top-5 flex gap-3 items-center">
        <PlugSocketIcon
          color="primary"
          fill={connected ? "white" : "primary"}
        />
      </div>
    </div>
  );
}
