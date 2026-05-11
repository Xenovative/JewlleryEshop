-- AlterTable
ALTER TABLE "Settings" ADD COLUMN "bankFpsInstructions" TEXT;
ALTER TABLE "Settings" ADD COLUMN "kpayAlipayBaseUrl" TEXT;

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN "paymentProvider" TEXT;

-- RedefineTables (SQLite): Order.stripeSessionId nullable + paymentProvider
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "stripeSessionId" TEXT,
    "status" TEXT NOT NULL,
    "amountTotalCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'hkd',
    "email" TEXT,
    "itemsJson" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "customerId" TEXT,
    "paymentProvider" TEXT NOT NULL DEFAULT 'stripe',
    CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Order" ("id", "stripeSessionId", "status", "amountTotalCents", "currency", "email", "itemsJson", "createdAt", "customerId", "paymentProvider") SELECT "id", "stripeSessionId", "status", "amountTotalCents", "currency", "email", "itemsJson", "createdAt", "customerId", 'stripe' FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
CREATE UNIQUE INDEX "Order_stripeSessionId_key" ON "Order"("stripeSessionId");
CREATE INDEX "Order_customerId_idx" ON "Order"("customerId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
