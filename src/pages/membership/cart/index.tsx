"use client";

import Navbar from "@/components/Navbar";
import MembershipLayout from "../layout";
import { useEffect, useState } from "react";
import { deleteCartById, getCartByAddress } from "@/lib/cart";
import { getWallet } from "@/lib/auth";
import { useWallet } from "@meshsdk/react";
import { CartData } from "@/lib/cart";
import CartImage from "@/components/CartImage";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import CheckOut from "@/components/CheckOut";
import { toast } from "@/hooks/use-toast";

export default function Cart() {
  const { wallet, connect } = useWallet();
  const [walletAddress, setWalletAddress] = useState("");
  const [cartData, setCartData] = useState<CartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        const selectedWalletString = getWallet();
        if (selectedWalletString) {
          const selectedWallet = JSON.parse(selectedWalletString);
          await connect(selectedWallet.name);

          if (wallet && walletAddress === "") {
            const addr = await wallet.getChangeAddress();
            setWalletAddress(addr);
          }
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchWalletData();
  }, [wallet, walletAddress]);

  useEffect(() => {
    const getCart = async () => {
      if (!walletAddress) {
        return;
      }

      try {
        const data = await getCartByAddress(walletAddress);
        if (data) {
          setCartData(data);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    getCart();
  }, [walletAddress]);

  const handleDelete = async (id: number, title: string) => {
    try {
      await deleteCartById(id);
      setCartData((prevData) => prevData.filter((item) => item.id !== id));

      toast({
        className: "bg-green-900 text-white",
        description: `${title} deleted successfully`,
      });
    } catch (error) {
      console.error("Error in handleDelete:", error);
      toast({
        variant: "destructive",
        description:
          error instanceof Error ? error.message : `Failed to delete ${title}`,
      });
    }
  };

  return (
    <MembershipLayout>
      <div className="grid gap-5">
        <Navbar title="Cart" />
        {loading ? (
          <div className="flex justify-center">
            <Loader2 className="animate-spin" size={40} />
          </div>
        ) : !cartData || cartData.length === 0 ? (
          <p className="text-xl text-center">Your cart is empty</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cartData.map((data, idx) => (
              <div key={idx} className="p-4 border rounded-lg flex flex-col">
                <div className="p-2 flex justify-center items-center">
                  <CartImage imageId={data.image!} title={data.title} />
                </div>
                <div className="grid gap-4">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <h2 className="font-semibold text-2xl text-clip overflow-clip">
                      {data.title}
                    </h2>
                    <p>Price: ₳&nbsp;&nbsp;{data.price}</p>
                    <p>Quantity: {data.qty}</p>
                  </div>
                  <div className="flex gap-4 justify-center">
                    <Link
                      href={`${data.membership.toLowerCase()}/${data.slug}`}
                    >
                      <Button className="font-semibold text-white">
                        See Details
                      </Button>
                    </Link>
                    <CheckOut
                      walletAddress={walletAddress}
                      qty={data.qty}
                      price={data.price}
                    />
                  </div>
                </div>
                <div className="absolute">
                  <Button
                    variant="ghost"
                    className="size-10 rounded-md bg-red-600 hover:bg-red-500 border-none"
                    onClick={() => handleDelete(data.id, data.title)}
                  >
                    <Trash2 color="white" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MembershipLayout>
  );
}
