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
import contractBlueprint from "../../../smart-contracts/plutus.json";
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
import {
  getTransaction,
  TransactionData,
  updateTransactionStatus,
} from "@/lib/prisma/transaction";

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

export default function Orders() {
  const { connected, wallet } = useWallet();
  const [loading, setLoading] = useState(true);
  const [utxoList, setUtxoList] = useState<UTxO[]>([]);
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  const fetchData = async () => {
    if (connected) {
      const ts = await getTransaction();
      setTransactions(ts);
      getUtxosListContractAddr();
    }
  };

  useEffect(() => {
    fetchData();
  }, [connected]);

  async function getUtxosListContractAddr() {
    setLoading(true);
    const utxos: UTxO[] = await nodeProvider.fetchAddressUTxOs(contractAddress);
    setUtxoList(utxos);
    setLoading(false);
  }

  const filterUtxosByTransactions = (
    utxos: UTxO[],
    transactions: TransactionData[]
  ) => {
    const transactionIds = transactions.map((tx) => tx.tx_id);
    return utxos.filter((utxo) => transactionIds.includes(utxo.input.txHash));
  };

  const filteredUtxos = filterUtxosByTransactions(utxoList, transactions);

  const totalLockedAda = filteredUtxos.reduce((total, utxo) => {
    return total + Number(utxo.output.amount[0].quantity) / 1_000_000;
  }, 0);

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredUtxos.slice(indexOfFirstRow, indexOfLastRow);

  const totalPages = Math.ceil(filteredUtxos.length / rowsPerPage);

  async function getWalletInfo() {
    const walletAddress = await wallet.getChangeAddress();
    const utxos = await wallet.getUtxos();
    const collateral = (await wallet.getCollateral())[0];
    return { walletAddress, utxos, collateral };
  }

  async function handleDeliver(txId: string) {
    try {
      setLoading(true);
      await updateTransactionStatus(txId);
      toast({
        title: "Status Updated",
        description: "Transaction has been marked as delivered",
        className: "bg-green-900 text-white",
      });

      await fetchData();
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update transaction status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
        verbose: true,
      });

      const txDraft = await txBuild
        .spendingPlutusScript("V3")
        .txIn(txHash, index, amount, address)
        .txInScript(scriptCbor)
        .txInRedeemerValue(mConStr0([stringToHex("")]))
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
      toast({
        description: (
          <div className="flex items-center justify-center">
            <Loader2 className="size-4 mr-2 animate-spin" />
            <p>Withdrawing...</p>
          </div>
        ),
      });
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
        fetchData();
      }, 0);

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

          {currentRows.length === 0 && loading && (
            <Loader2 className="animate-spin" size={40} />
          )}
          {currentRows.length === 0 && !loading && (
            <p className="text-xl">No Funds</p>
          )}
          {currentRows.length > 0 && (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-secondary-foreground font-bold">
                      Name
                    </TableHead>
                    <TableHead className="text-secondary-foreground font-bold">
                      Address
                    </TableHead>
                    <TableHead className="text-secondary-foreground font-bold">
                      Item
                    </TableHead>
                    <TableHead className="text-secondary-foreground font-bold">
                      Qty
                    </TableHead>
                    <TableHead className="text-secondary-foreground font-bold">
                      Price
                    </TableHead>
                    <TableHead className="text-secondary-foreground font-bold">
                      Shipment Fee
                    </TableHead>
                    <TableHead className="text-secondary-foreground font-bold">
                      Total
                    </TableHead>
                    <TableHead className="text-secondary-foreground font-bold">
                      Date Ordered
                    </TableHead>
                    <TableHead className="text-secondary-foreground font-bold">
                      Status
                    </TableHead>
                    <TableHead className="text-secondary-foreground font-bold">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentRows.map((utxo, index) => {
                    const transaction = transactions.find(
                      (tx) => tx.tx_id === utxo.input.txHash
                    );
                    return (
                      <TableRow key={index}>
                        <TableCell>{transaction?.name}</TableCell>
                        <TableCell>{transaction?.address}</TableCell>
                        <TableCell>{transaction?.item_name}</TableCell>
                        <TableCell>{transaction?.qty}</TableCell>
                        <TableCell>₳&nbsp;&nbsp;{transaction?.price}</TableCell>
                        <TableCell>₳&nbsp;&nbsp;20</TableCell>
                        <TableCell>
                          ₳&nbsp;&nbsp;
                          {transaction?.qty! * transaction?.price! + 20}
                        </TableCell>
                        <TableCell>
                          {new Date(transaction?.date_ordered!).toDateString()}
                        </TableCell>
                        <TableCell>{transaction?.status}</TableCell>
                        <TableCell className="flex gap-2">
                          {transaction?.status === "Pending" && (
                            <Button
                              className="bg-primary text-white text-sm font-bold p-2 rounded"
                              onClick={() => handleDeliver(transaction?.tx_id!)}
                              disabled={loading}
                            >
                              {loading ? (
                                <Loader2 className="size-4 animate-spin" />
                              ) : (
                                "Deliver"
                              )}
                            </Button>
                          )}
                          {transaction?.status === "Delivered" && (
                            <p>Waiting for Buyer confirmation...</p>
                          )}
                          {transaction?.status === "Completed" && (
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
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
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
