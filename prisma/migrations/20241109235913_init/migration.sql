-- AlterTable
ALTER TABLE "BankAccount" ALTER COLUMN "balance" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isBanned" BOOLEAN NOT NULL DEFAULT false;
