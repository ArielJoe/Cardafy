-- CreateTable
CREATE TABLE "Cart" (
    "id" SERIAL NOT NULL,
    "address" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,
    "membership" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "Cart_pkey" PRIMARY KEY ("id")
);
