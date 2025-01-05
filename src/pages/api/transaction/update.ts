import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma/db";

enum TransactionStatus {
  Pending = "Pending",
  Delivered = "Delivered",
  Completed = "Completed",
  Canceled = "Canceled",
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { tx_id } = req.body;

    if (!tx_id) {
      return res
        .status(400)
        .json({ message: "Transaction ID (tx_id) is required" });
    }

    const currentTransaction = await prisma.transaction.findUnique({
      where: { tx_id: tx_id },
    });

    if (!currentTransaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    let newStatus: TransactionStatus;

    switch (currentTransaction.status) {
      case TransactionStatus.Pending:
        newStatus = TransactionStatus.Delivered;
        break;
      case TransactionStatus.Delivered:
        newStatus = TransactionStatus.Completed;
        break;
      default:
        return res.status(400).json({
          message: `Transaction cannot be updated. Current status: ${currentTransaction.status}`,
        });
    }

    const updatedTransaction = await prisma.transaction.update({
      where: { tx_id: tx_id },
      data: { status: newStatus },
    });

    return res.status(200).json(updatedTransaction);
  } catch (error) {
    console.error("Failed to update transaction status:", error);
    return res.status(500).json({
      message: "Error updating transaction status",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
