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
import contractBlueprint from "../../../aiken-workspace/plutus.json";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

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

export default function Orders() {
  const { connected, wallet } = useWallet();
  const [loading, setLoading] = useState(false);
  const [utxoList, setUtxoList] = useState<UTxO[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  useEffect(() => {
    setUtxoList([]);
    if (connected) {
      getUtxosListContractAddr();
    }
  }, [connected]);

  async function getUtxosListContractAddr() {
    setLoading(true);
    const utxos: UTxO[] = await nodeProvider.fetchAddressUTxOs(contractAddress);
    setUtxoList(utxos);
    setLoading(false);
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
        toast({
          title: "Withdraw Declined",
          description: `${error}`,
          variant: "destructive",
        });
        return;
      }
      const txHash_ = await wallet.submitTx(signedTx);
      setLoading(false);
      setUtxoList([]);

      setTimeout(() => {
        toast({
          title: "Withdraw Success",
          description: (
            <div className="flex flex-col">
              <span>Transaction Hash:</span>
              <span className="break-all text-sm mt-1">{txHash_}</span>
            </div>
          ),
          className: "bg-green-900 text-white",
        });
        getUtxosListContractAddr();
        setLoading(true);
      }, 3000);

      return;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      toast({
        title: "Withdraw Failed",
        description: (
          <div className="flex flex-col">
            <span className="break-all text-sm mt-1">{errorMessage}</span>
          </div>
        ),
        variant: "destructive",
      });
      return;
    }
  }

  const totalLockedAda = utxoList.reduce((total, utxo) => {
    return total + Number(utxo.output.amount[0].quantity) / 1_000_000;
  }, 0);

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = utxoList.slice(indexOfFirstRow, indexOfLastRow);

  const totalPages = Math.ceil(utxoList.length / rowsPerPage);

  return (
    <div className="z-10">
      {connected && (
        <div className="flex justify-center items-center flex-col">
          <div className="mb-6 text-xl">
            Total Locked:
            <span className="font-semibold">
              &nbsp;₳&nbsp;{totalLockedAda.toFixed(2)}
            </span>
          </div>

          {utxoList.length === 0 && loading && (
            <Loader2 className="animate-spin" size={40} />
          )}
          {utxoList.length === 0 && !loading && (
            <p className="text-xl">No Funds</p>
          )}
          {utxoList.length > 0 && !loading && (
            <>
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
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentRows.map((utxo, index) => (
                    <TableRow key={index}>
                      <TableCell>{utxo.input.txHash}</TableCell>
                      <TableCell>
                        ₳&nbsp;&nbsp;
                        {Number(utxo.output.amount[0].quantity) / 1_000_000}
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
              {currentRows.length !== 0 && (
                <div className="flex justify-center items-center gap-4 mt-4">
                  <Button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="border size-10 rounded-md"
                  >
                    <ChevronLeft color="white" />
                  </Button>
                  <span>
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="border size-10 rounded-md"
                  >
                    <ChevronRight color="white" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
