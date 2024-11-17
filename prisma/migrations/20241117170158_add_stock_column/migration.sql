-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "product_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "cost" DECIMAL NOT NULL,
    "image_filename" TEXT,
    "stock" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_Product" ("cost", "description", "image_filename", "name", "product_id") SELECT "cost", "description", "image_filename", "name", "product_id" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
