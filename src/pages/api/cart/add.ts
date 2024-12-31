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
    const { address, title, image, qty, price, membership, slug } = req.body;

    if (
      !address ||
      !title ||
      !image ||
      !qty ||
      !price ||
      !membership ||
      !slug
    ) {
      return res.status(400).json({
        message: "Missing required fields",
        receivedData: req.body,
      });
    }

    const cartItem = await prisma.cart.create({
      data: {
        address,
        title,
        image: image,
        qty: Number(qty),
        price: price,
        membership,
        slug,
      },
    });

    return res.status(200).json(cartItem);
  } catch (error) {
    console.error("Failed to add to cart:", error);
    return res.status(500).json({
      message: "Error adding to cart",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
