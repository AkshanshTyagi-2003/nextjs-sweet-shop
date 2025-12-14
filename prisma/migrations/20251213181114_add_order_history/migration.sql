/*
  Warnings:

  - You are about to alter the column `price` on the `Sweet` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Int`.

*/
-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "sweetId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "userRole" TEXT NOT NULL,
    "sweetName" TEXT NOT NULL,
    "sweetCategory" TEXT NOT NULL,
    "pricePerUnit" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "totalPrice" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Order_sweetId_fkey" FOREIGN KEY ("sweetId") REFERENCES "Sweet" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Sweet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Sweet" ("category", "createdAt", "id", "name", "price", "quantity", "updatedAt") SELECT "category", "createdAt", "id", "name", "price", "quantity", "updatedAt" FROM "Sweet";
DROP TABLE "Sweet";
ALTER TABLE "new_Sweet" RENAME TO "Sweet";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
