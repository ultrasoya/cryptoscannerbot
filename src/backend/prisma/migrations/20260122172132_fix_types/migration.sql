-- CreateEnum
CREATE TYPE "Chain" AS ENUM ('ETH', 'BSC', 'SOLANA', 'POLYGON');

-- CreateEnum
CREATE TYPE "AlertCondition" AS ENUM ('ABOVE', 'BELOW');

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL,
    "telegramId" TEXT NOT NULL,
    "chain" "Chain" NOT NULL DEFAULT 'ETH',
    "tokenAddress" TEXT NOT NULL,
    "symbol" TEXT,
    "targetPrice" DOUBLE PRECISION NOT NULL,
    "condition" "AlertCondition" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastTriggered" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Alert_tokenAddress_isActive_idx" ON "Alert"("tokenAddress", "isActive");
