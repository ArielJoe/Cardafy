import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const transaction = await prisma.transaction.findMany();

    return res.status(200).json(transaction);
  } catch (error) {
    console.error("Failed to get transaction:", error);
    return res.status(500).json({
      message: "Error getting transaction",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
