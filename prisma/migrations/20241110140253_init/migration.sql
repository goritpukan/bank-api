/*
  Warnings:

  - You are about to drop the column `isBanned` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "isBanned",
ADD COLUMN     "isBlocked" BOOLEAN NOT NULL DEFAULT false;
