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
    const { address } = req.body;

    if (!address) {
      return res.status(400).json({
        message: "Missing required fields",
        receivedData: req.body,
      });
    }

    const cartItems = await prisma.cart.findMany({
      where: {
        address: address,
      },
    });

    return res.status(200).json(cartItems);
  } catch (error) {
    console.error("Failed to get items:", error);
    return res.status(500).json({
      message: "Error getting items",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
