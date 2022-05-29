-- DropIndex
DROP INDEX "Stock_userId_key";

-- AlterTable
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_pkey" PRIMARY KEY ("userId");
