/*
  Warnings:

  - You are about to drop the column `convertedAmoun` on the `Transaction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "convertedAmoun",
ADD COLUMN     "convertedAmount" DOUBLE PRECISION;
