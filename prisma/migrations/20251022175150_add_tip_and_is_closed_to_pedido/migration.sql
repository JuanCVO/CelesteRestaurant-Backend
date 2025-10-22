-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "isClosed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tip" DECIMAL(10,2);
