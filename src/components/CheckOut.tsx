import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface CheckOutProps {
  walletAddress: string;
  qty: number;
  price: number;
}

interface FormErrors {
  name?: string;
  address?: string;
}

const CheckOut: React.FC<CheckOutProps> = ({ walletAddress, qty, price }) => {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    if (!name.trim()) {
      newErrors.name = "Name is required";
      isValid = false;
    }

    if (!address.trim()) {
      newErrors.address = "Address is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    console.log("Checkout successful:", {
      walletAddress,
      qty,
      price,
      name,
      address,
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="font-semibold text-white">Buy</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-3xl">Checkout</DialogTitle>
          <DialogDescription>Fill in the informations below!</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="text-right self-start pt-2">
              <Label htmlFor="name">Name</Label>
            </div>
            <div className="col-span-3 space-y-2">
              <Input
                id="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) {
                    setErrors((prev) => ({ ...prev, name: undefined }));
                  }
                }}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-right self-start pt-2">
              <Label htmlFor="address">Address</Label>
            </div>
            <div className="col-span-3 space-y-2">
              <Textarea
                id="address"
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  if (errors.address) {
                    setErrors((prev) => ({ ...prev, address: undefined }));
                  }
                }}
                className={`rounded-none border ${errors.address ? "border-red-500" : ""}`}
              />
              {errors.address && (
                <p className="text-sm text-red-500">{errors.address}</p>
              )}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-end items-end gap-1 font-bold text-base">
            <div className="whitespace-nowrap">
              ₳ {price} x {qty}
            </div>
            <div className="whitespace-nowrap">
              + {20} {"(Shipment Fee)"}
            </div>
            <div className="whitespace-nowrap">= ₳ {price * qty + 20}</div>
          </div>
          <DialogFooter className="flex items-center gap-2">
            <Button type="submit" className="font-semibold text-white">
              Pay
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CheckOut;
