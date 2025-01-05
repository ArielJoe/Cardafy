import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma/db";
import { date } from "zod";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const {
      tx_id,
      name,
      address,
      item_name,
      qty,
      price,
      date_ordered,
      status,
    } = req.body;

    if (!tx_id || !name || !address || !date || !status) {
      return res.status(400).json({
        message: "Missing required fields",
        receivedData: req.body,
      });
    }

    const transaction = await prisma.transaction.create({
      data: {
        tx_id,
        name,
        address,
        item_name,
        qty,
        price,
        date_ordered,
        status,
      },
    });

    return res.status(200).json(transaction);
  } catch (error) {
    console.error("Failed to add to transaction:", error);
    return res.status(500).json({
      message: "Error adding to transaction",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
