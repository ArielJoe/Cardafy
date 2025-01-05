/*
  Warnings:

  - A unique constraint covering the columns `[tx_id]` on the table `Transaction` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Transaction_tx_id_key" ON "Transaction"("tx_id");
