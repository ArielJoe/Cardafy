import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({
        message: "Missing required fields",
        receivedData: req.body,
      });
    }

    const cartItems = await prisma.cart.delete({
      where: {
        id: id,
      },
    });

    return res.status(200).json(cartItems);
  } catch (error) {
    console.error("Failed to delete item", error);
    return res.status(500).json({
      message: "Error deleting items",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
