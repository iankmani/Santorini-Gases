-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');

-- CreateTable
CREATE TABLE "Transaction" (
    "id" SERIAL NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "accountReference" TEXT NOT NULL,
    "checkoutRequestID" TEXT NOT NULL,
    "merchantRequestID" TEXT NOT NULL,
    "mpesaReceiptNumber" TEXT,
    "transactionDate" TIMESTAMP(3),
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_checkoutRequestID_key" ON "Transaction"("checkoutRequestID");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_merchantRequestID_key" ON "Transaction"("merchantRequestID");
