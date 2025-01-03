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
import {
  BlockfrostProvider,
  deserializeAddress,
  serializePlutusScript,
  mConStr0,
  MeshTxBuilder,
  Asset,
} from "@meshsdk/core";
import { applyParamsToScript } from "@meshsdk/core-csl";
import contractBlueprint from "../../../aiken-workspace/plutus.json";
import { useWallet } from "@meshsdk/react";
import { toast } from "@/hooks/use-toast";

interface CheckOutProps {
  walletAddress: string;
  qty: number;
  price: number;
}

interface FormErrors {
  name?: string;
  address?: string;
}

const blockfrostApiKey = process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY;
const nodeProvider = new BlockfrostProvider(blockfrostApiKey!);

const CheckOut: React.FC<CheckOutProps> = ({ qty, price }) => {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { wallet } = useWallet();

  function getScript(
    blueprintCompiledCode: string,
    params: string[] = [],
    version: "V1" | "V2" | "V3" = "V3"
  ) {
    const scriptCbor = applyParamsToScript(blueprintCompiledCode, params);
    const scriptAddr = serializePlutusScript(
      { code: scriptCbor, version: version },
      undefined,
      0
    ).address;
    return { scriptCbor, scriptAddr };
  }

  async function getWalletInfo() {
    const utxos = await wallet.getUtxos();
    const collateral = (await wallet.getCollateral())[0];
    const walletAddress = await wallet.getChangeAddress();
    return { utxos, collateral, walletAddress };
  }

  async function txHandler(
    e: React.FormEvent,
    price: number,
    quantity: number
  ) {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const { scriptAddr } = getScript(
        contractBlueprint.validators[0].compiledCode
      );
      const { utxos, walletAddress } = await getWalletInfo();
      const signerHash = deserializeAddress(walletAddress).pubKeyHash;
      const lovelaceAmount = ((price * quantity + 20) * 1000000).toString();
      const assets: Asset[] = [{ unit: "lovelace", quantity: lovelaceAmount }];

      const txBuild = new MeshTxBuilder({
        fetcher: nodeProvider,
        evaluator: nodeProvider,
        verbose: true,
      });

      const txDraft = await txBuild
        .setNetwork("preprod")
        .txOut(scriptAddr, assets)
        .txOutDatumHashValue(mConStr0([signerHash]))
        .changeAddress(walletAddress)
        .selectUtxosFrom(utxos)
        .complete();

      const signedTx = await wallet.signTx(txDraft);
      const txHash = await wallet.submitTx(signedTx);

      toast({
        title: "Transaction Success",
        description: (
          <div className="flex flex-col">
            <span>Transaction Hash:</span>
            <span className="break-all text-sm mt-1">{txHash}</span>
          </div>
        ),
        className: "bg-green-900 text-white",
      });

      setIsDialogOpen(false);
      setName("");
      setAddress("");
      return;
    } catch (error) {
      toast({
        title: "Transaction Failed",
        description: `${error}`,
        variant: "destructive",
      });
      return;
    }
  }

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

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="font-semibold text-white">Buy</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-3xl">Checkout</DialogTitle>
          <DialogDescription>Fill in the informations below!</DialogDescription>
        </DialogHeader>
        <form onSubmit={(e) => txHandler(e, price, qty)} className="grid gap-4">
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
