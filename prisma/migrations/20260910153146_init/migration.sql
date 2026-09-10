-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('FARMER', 'BUYER');

-- CreateEnum
CREATE TYPE "public"."PoolStatus" AS ENUM ('MATCHING', 'FULFILLED', 'COLLECTION', 'CONSOLIDATED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "public"."OrderStatus" AS ENUM ('OPEN', 'CREATED', 'MATCHED', 'POOL_CREATED', 'COLLECTION', 'CONSOLIDATION', 'DISPATCHED', 'DELIVERED', 'COMPLETED');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "public"."UserRole" NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FarmerProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "farmName" TEXT,

    CONSTRAINT "FarmerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BuyerProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "location" TEXT NOT NULL,

    CONSTRAINT "BuyerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Produce" (
    "id" TEXT NOT NULL,
    "farmerId" TEXT NOT NULL,
    "crop" TEXT NOT NULL,
    "quantityKg" DOUBLE PRECISION NOT NULL,
    "pricePerKg" DOUBLE PRECISION NOT NULL,
    "location" TEXT NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Produce_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BulkOrder" (
    "id" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "crop" TEXT NOT NULL,
    "requiredQuantityKg" DOUBLE PRECISION NOT NULL,
    "maximumPricePerKg" DOUBLE PRECISION NOT NULL,
    "deliveryLocation" TEXT NOT NULL,
    "deliveryDate" TIMESTAMP(3) NOT NULL,
    "status" "public"."OrderStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BulkOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FarmPool" (
    "id" TEXT NOT NULL,
    "poolCode" TEXT NOT NULL,
    "bulkOrderId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "matchedQuantityKg" DOUBLE PRECISION NOT NULL,
    "averagePricePerKg" DOUBLE PRECISION NOT NULL,
    "status" "public"."PoolStatus" NOT NULL DEFAULT 'MATCHING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FarmPool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FarmPoolMember" (
    "id" TEXT NOT NULL,
    "farmPoolId" TEXT NOT NULL,
    "produceId" TEXT NOT NULL,
    "contributionKg" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "FarmPoolMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Order" (
    "id" TEXT NOT NULL,
    "orderCode" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "farmPoolId" TEXT NOT NULL,
    "status" "public"."OrderStatus" NOT NULL DEFAULT 'CREATED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "crop" TEXT NOT NULL,
    "quantityKg" DOUBLE PRECISION NOT NULL,
    "pricePerKg" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "FarmerProfile_userId_key" ON "public"."FarmerProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "BuyerProfile_userId_key" ON "public"."BuyerProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FarmPool_poolCode_key" ON "public"."FarmPool"("poolCode");

-- CreateIndex
CREATE UNIQUE INDEX "FarmPool_bulkOrderId_key" ON "public"."FarmPool"("bulkOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "FarmPoolMember_farmPoolId_produceId_key" ON "public"."FarmPoolMember"("farmPoolId", "produceId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderCode_key" ON "public"."Order"("orderCode");

-- CreateIndex
CREATE UNIQUE INDEX "Order_farmPoolId_key" ON "public"."Order"("farmPoolId");

-- AddForeignKey
ALTER TABLE "public"."FarmerProfile" ADD CONSTRAINT "FarmerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BuyerProfile" ADD CONSTRAINT "BuyerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Produce" ADD CONSTRAINT "Produce_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BulkOrder" ADD CONSTRAINT "BulkOrder_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FarmPool" ADD CONSTRAINT "FarmPool_bulkOrderId_fkey" FOREIGN KEY ("bulkOrderId") REFERENCES "public"."BulkOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FarmPool" ADD CONSTRAINT "FarmPool_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FarmPoolMember" ADD CONSTRAINT "FarmPoolMember_farmPoolId_fkey" FOREIGN KEY ("farmPoolId") REFERENCES "public"."FarmPool"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FarmPoolMember" ADD CONSTRAINT "FarmPoolMember_produceId_fkey" FOREIGN KEY ("produceId") REFERENCES "public"."Produce"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_farmPoolId_fkey" FOREIGN KEY ("farmPoolId") REFERENCES "public"."FarmPool"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
