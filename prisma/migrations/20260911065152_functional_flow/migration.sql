-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."OrderStatus" ADD VALUE 'ORDER_PLACED';
ALTER TYPE "public"."OrderStatus" ADD VALUE 'COLLECTION_POINT';

-- AlterTable
ALTER TABLE "public"."Produce" ADD COLUMN     "readyDate" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "public"."BulkOrderItem" (
    "id" TEXT NOT NULL,
    "bulkOrderId" TEXT NOT NULL,
    "crop" TEXT NOT NULL,
    "requiredQuantityKg" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "BulkOrderItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."BulkOrderItem" ADD CONSTRAINT "BulkOrderItem_bulkOrderId_fkey" FOREIGN KEY ("bulkOrderId") REFERENCES "public"."BulkOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
