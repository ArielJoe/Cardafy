-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('Pending', 'Delivered', 'Canceled');

-- CreateTable
CREATE TABLE "Transaction" (
    "id" SERIAL NOT NULL,
    "tx_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "date_ordered" TIMESTAMP(3) NOT NULL,
    "status" "TransactionStatus" NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);
