/*
  Warnings:

  - You are about to drop the column `total_price` on the `Transaction` table. All the data in the column will be lost.
  - Added the required column `price` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `qty` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "total_price",
ADD COLUMN     "price" INTEGER NOT NULL,
ADD COLUMN     "qty" INTEGER NOT NULL;
