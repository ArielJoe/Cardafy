"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@meshsdk/react";
import {
  BlockfrostProvider,
  UTxO,
  deserializeAddress,
  serializePlutusScript,
  mConStr0,
  stringToHex,
  MeshTxBuilder,
  Asset,
} from "@meshsdk/core";
import { applyParamsToScript } from "@meshsdk/core-csl";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Loader2, ScrollText } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import cbor from "cbor";

import contractBlueprint from "../../aiken-workspace/plutus.json";

const scriptCbor = applyParamsToScript(
  contractBlueprint.validators[0].compiledCode,
  []
);

const contractAddress = serializePlutusScript(
  { code: scriptCbor, version: "V3" },
  undefined,
  0
).address;

const blockfrostApiKey = process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY;

const nodeProvider = new BlockfrostProvider(blockfrostApiKey!);

const refNumber = "17925";

const timeout = 30000;

export default function OnChain() {
  const { connected, wallet } = useWallet();
  const [loading, setLoading] = useState(true);
  const [utxoList, setUtxoList] = useState<UTxO[]>([]);
  const [totalLockedAda, setTotalLockedAda] = useState<number>(0);
  const [datumInfo, setDatumInfo] = useState<{ [key: string]: any }>({});

  useEffect(() => {
    setUtxoList([]);
    if (connected) {
      getUtxosListContractAddr();
    }
  }, [connected]);

  async function getUtxosListContractAddr() {
    const utxos: UTxO[] = await nodeProvider.fetchAddressUTxOs(contractAddress);
    setUtxoList(utxos);

    let totalLockedAda = 0;
    utxos.forEach((utxo) => {
      totalLockedAda += Number(utxo.output.amount[0].quantity) / 1_000_000;
    });

    setTotalLockedAda(totalLockedAda);

    const datumInfoMap: { [key: string]: any } = {};
    for (const utxo of utxos) {
      if (utxo.output.dataHash) {
        const datum = await fetchDatumFromBlockfrost(utxo.output.dataHash);
        if (datum) {
          const parsedDatum = decodeDatumCbor(datum);
          datumInfoMap[utxo.input.txHash] = parsedDatum;
        }
      }
    }
    setDatumInfo(datumInfoMap);
  }

  async function fetchDatumFromBlockfrost(
    datumHash: string
  ): Promise<string | null> {
    try {
      const response = await fetch(
        `https://cardano-mainnet.blockfrost.io/api/v0/scripts/datum/${datumHash}`,
        {
          headers: {
            project_id: blockfrostApiKey!,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch datum: ${response.statusText}`);
      }

      const data = await response.json();
      return data.cbor;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  function decodeDatumCbor(datumCbor: string): any {
    try {
      const decoded = cbor.decodeFirstSync(Buffer.from(datumCbor, "hex"));
      return decoded;
    } catch (error) {
      console.log("Error decoding datum CBOR:", error);
      return null;
    }
  }

  async function getWalletInfo() {
    const walletAddress = await wallet.getChangeAddress();
    const utxos = await wallet.getUtxos();
    const collateral = (await wallet.getCollateral())[0];
    return { walletAddress, utxos, collateral };
  }

  async function handleTx(
    txHash: string,
    index: number,
    amount: Asset[],
    address: string
  ) {
    try {
      const { walletAddress, utxos, collateral } = await getWalletInfo();

      const signerHash = deserializeAddress(walletAddress).pubKeyHash;

      const txBuild = new MeshTxBuilder({
        fetcher: nodeProvider,
        submitter: nodeProvider,
      });
      const txDraft = await txBuild
        .spendingPlutusScript("V3")
        .txIn(txHash, index, amount, address)
        .txInScript(scriptCbor)
        .txInRedeemerValue(mConStr0([stringToHex(refNumber)]))
        .txInDatumValue(mConStr0([signerHash]))
        .requiredSignerHash(signerHash)
        .changeAddress(walletAddress)
        .txInCollateral(
          collateral.input.txHash,
          collateral.input.outputIndex,
          collateral.output.amount,
          collateral.output.address
        )
        .selectUtxosFrom(utxos)
        .complete();

      let signedTx;
      try {
        signedTx = await wallet.signTx(txDraft);
      } catch (error) {
        return;
      }

      const txHash_ = await wallet.submitTx(signedTx);
      setLoading(false);
      setUtxoList([]);

      setTimeout(() => {
        alert(`Transaction successful : ${txHash_}`);
        getUtxosListContractAddr();
        setLoading(true);
      }, timeout);

      return;
    } catch (error) {
      alert(`Transaction failed ${error}`);
      return;
    }
  }

  return (
    <div className="flex-col justify-center items-center">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 bg-black text-white hover:bg-white hover:text-black dark:border-white hover:dark:bg-primary hover:dark:text-white"
          >
            <ScrollText />
          </Button>
        </SheetTrigger>
        <SheetContent side="top" className="h-[80vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-3xl">Your Transactions</SheetTitle>
            <SheetDescription>Manage your transactions.</SheetDescription>
          </SheetHeader>

          {connected && (
            <div className="mb-6 text-xl text-center">
              Total Locked:
              <span className="font-semibold">
                &nbsp;₳&nbsp;{totalLockedAda.toFixed(2)}
              </span>
            </div>
          )}

          {connected && (
            <div className="flex justify-center items-center">
              {utxoList.length === 0 && !loading && (
                <Loader2 className="animate-spin" size={40} />
              )}
              {utxoList.length === 0 && loading && (
                <p className="text-xl">No Transactions</p>
              )}
              {utxoList.length > 0 && loading && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-secondary-foreground font-bold">
                        Transaction ID
                      </TableHead>
                      <TableHead className="text-secondary-foreground font-bold">
                        Revenue
                      </TableHead>
                      <TableHead className="text-secondary-foreground font-bold">
                        Datum Info
                      </TableHead>
                      <TableHead className="text-secondary-foreground font-bold">
                        Action
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {utxoList.map((utxo, index) => (
                      <TableRow key={index}>
                        <TableCell>{utxo.input.txHash}</TableCell>
                        <TableCell>
                          ₳&nbsp;&nbsp;
                          {Number(utxo.output.amount[0].quantity) / 1_000_000}
                        </TableCell>
                        <TableCell>
                          {datumInfo[utxo.input.txHash]
                            ? JSON.stringify(datumInfo[utxo.input.txHash])
                            : "No Datum"}
                        </TableCell>
                        <TableCell>
                          <Button
                            className="bg-primary text-white text-sm font-bold p-2 rounded"
                            onClick={() =>
                              handleTx(
                                utxo.input.txHash,
                                utxo.input.outputIndex,
                                utxo.output.amount,
                                utxo.output.address
                              )
                            }
                          >
                            Withdraw
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          )}
          <SheetFooter>
            <SheetClose asChild></SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
