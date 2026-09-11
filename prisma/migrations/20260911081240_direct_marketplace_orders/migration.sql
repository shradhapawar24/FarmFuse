-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."OrderStatus" ADD VALUE 'PENDING';
ALTER TYPE "public"."OrderStatus" ADD VALUE 'ACCEPTED';
ALTER TYPE "public"."OrderStatus" ADD VALUE 'REJECTED';
ALTER TYPE "public"."OrderStatus" ADD VALUE 'PREPARING';
ALTER TYPE "public"."OrderStatus" ADD VALUE 'READY';

-- DropForeignKey
ALTER TABLE "public"."Order" DROP CONSTRAINT "Order_farmPoolId_fkey";

-- AlterTable
ALTER TABLE "public"."Order" ADD COLUMN     "farmerId" TEXT,
ADD COLUMN     "inventoryRestored" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ALTER COLUMN "farmPoolId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."OrderItem" ADD COLUMN     "produceId" TEXT,
ADD COLUMN     "unit" TEXT NOT NULL DEFAULT 'kg';

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_farmPoolId_fkey" FOREIGN KEY ("farmPoolId") REFERENCES "public"."FarmPool"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderItem" ADD CONSTRAINT "OrderItem_produceId_fkey" FOREIGN KEY ("produceId") REFERENCES "public"."Produce"("id") ON DELETE SET NULL ON UPDATE CASCADE;
