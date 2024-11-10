/*
  Warnings:

  - You are about to alter the column `accountNumber` on the `BankAccount` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(12)`.

*/
-- AlterTable
ALTER TABLE "BankAccount" ALTER COLUMN "accountNumber" SET DATA TYPE VARCHAR(12);
