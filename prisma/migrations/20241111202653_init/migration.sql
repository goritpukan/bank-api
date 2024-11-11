/*
  Warnings:

  - You are about to drop the column `bankAccountId` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `sourceType` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `timestamp` on the `Transaction` table. All the data in the column will be lost.
  - Added the required column `destinationAccountId` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "TransactionType" ADD VALUE 'TRANSFER';

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_bankAccountId_fkey";

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "bankAccountId",
DROP COLUMN "sourceType",
DROP COLUMN "timestamp",
ADD COLUMN     "destinationAccountId" INTEGER NOT NULL;

-- DropEnum
DROP TYPE "SourceType";

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_sourceAccountId_fkey" FOREIGN KEY ("sourceAccountId") REFERENCES "BankAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_destinationAccountId_fkey" FOREIGN KEY ("destinationAccountId") REFERENCES "BankAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
