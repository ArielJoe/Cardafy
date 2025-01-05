"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@meshsdk/react";
import {
  BlockfrostProvider,
  UTxO,
  deserializeAddress,
  serializePlutusScript,
  mConStr0,
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

import contractBlueprint from "../../smart-contracts/plutus.json";
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

export default function OnChain() {
  const { connected, wallet } = useWallet();
  const [loading, setLoading] = useState(true);
  const [utxoList, setUtxoList] = useState<UTxO[]>([]);
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [totalLockedAda, setTotalLockedAda] = useState<number>(0);
  const [processingTx, setProcessingTx] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransaction = async () => {
      setLoading(true);
      setUtxoList([]);
      if (connected) {
        try {
          const ts = await getTransaction();
          setTransactions(ts);
          await getUtxosListContractAddr(ts);
        } catch (error) {
          console.log(error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [connected]);

  const filterUtxosByTransactions = (
    utxos: UTxO[],
    transactions: TransactionData[]
  ) => {
    const transactionIds = transactions
      .filter((tx) => tx.status !== "Completed")
      .map((tx) => tx.tx_id);
    return utxos.filter((utxo) => transactionIds.includes(utxo.input.txHash));
  };

  async function getUtxosListContractAddr(transactions: TransactionData[]) {
    try {
      const utxos: UTxO[] =
        await nodeProvider.fetchAddressUTxOs(contractAddress);
      const filteredUtxos = filterUtxosByTransactions(utxos, transactions);
      setUtxoList(filteredUtxos);

      let totalLockedAda = 0;
      filteredUtxos.forEach((utxo) => {
        totalLockedAda += Number(utxo.output.amount[0].quantity) / 1_000_000;
      });

      setTotalLockedAda(totalLockedAda);
    } catch (error) {
      console.log(error);
    }
  }

  async function getWalletInfo() {
    const walletAddress = await wallet.getChangeAddress();
    const utxos = await wallet.getUtxos();
    const collateral = (await wallet.getCollateral())[0];

    return { walletAddress, utxos, collateral };
  }

  async function handleOrderCompleted(txId: string) {
    setProcessingTx(txId);
    try {
      const updatedTransaction = await updateTransactionStatus(txId);
      setTransactions((prevTransactions) =>
        prevTransactions.map((tx) =>
          tx.tx_id === txId ? { ...tx, status: "Completed" } : tx
        )
      );
      setUtxoList((prevUtxos) =>
        prevUtxos.filter((utxo) => utxo.input.txHash !== txId)
      );
      await getUtxosListContractAddr(transactions);
    } catch (error) {
      console.log(error);
    } finally {
      setProcessingTx(null);
    }
  }

  const filteredUtxos = filterUtxosByTransactions(utxoList, transactions);

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
              {loading ? (
                <Loader2 className="animate-spin" size={40} />
              ) : filteredUtxos.length === 0 ? (
                <p className="text-xl">No Transactions</p>
              ) : (
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
                    {filteredUtxos.map((utxo, index) => {
                      const transaction = transactions.find(
                        (tx) => tx.tx_id === utxo.input.txHash
                      );
                      return (
                        <TableRow key={index}>
                          <TableCell>{transaction?.name}</TableCell>
                          <TableCell>{transaction?.address}</TableCell>
                          <TableCell>{transaction?.item_name}</TableCell>
                          <TableCell>{transaction?.qty}</TableCell>
                          <TableCell>
                            ₳&nbsp;&nbsp;{transaction?.price}
                          </TableCell>
                          <TableCell>₳&nbsp;&nbsp;{20}</TableCell>
                          <TableCell>
                            ₳&nbsp;&nbsp;
                            {transaction?.qty! * transaction?.price! + 20}
                          </TableCell>
                          <TableCell>
                            {new Date(
                              transaction?.date_ordered!
                            ).toDateString()}
                          </TableCell>
                          <TableCell>{transaction?.status}</TableCell>
                          <TableCell>
                            {transaction?.status === "Pending" && (
                              <p>Waiting for Merchant confirmation...</p>
                            )}
                            {transaction?.status === "Delivered" && (
                              <Button
                                className="bg-primary text-white text-sm font-bold p-2 rounded"
                                onClick={async () =>
                                  await handleOrderCompleted(transaction?.tx_id)
                                }
                                disabled={processingTx === transaction?.tx_id}
                              >
                                {processingTx === transaction?.tx_id ? (
                                  <Loader2 className="animate-spin" size={20} />
                                ) : (
                                  "Order Completed"
                                )}
                              </Button>
                            )}
                            {transaction?.status === "Completed" && <p>-</p>}
                          </TableCell>
                        </TableRow>
                      );
                    })}
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
