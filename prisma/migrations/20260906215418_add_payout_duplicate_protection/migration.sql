/*
  Warnings:

  - A unique constraint covering the columns `[payoutKey]` on the table `Transaction` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "payoutKey" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_payoutKey_key" ON "Transaction"("payoutKey");
