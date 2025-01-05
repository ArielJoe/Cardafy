/*
  Warnings:

  - Added the required column `item_name` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_price` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "TransactionStatus" ADD VALUE 'Completed';

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "item_name" TEXT NOT NULL,
ADD COLUMN     "total_price" INTEGER NOT NULL;
