/*
  Warnings:

  - The `size` and `block` columns are dropped from the `Plot` table. The plot
    scheme is moving to the real project numbering (R-01..R-322, L-01..L-37),
    which carries no size/block data. Any existing values are discarded.

*/
-- AlterTable: drop plot size/block (no longer part of the data model)
ALTER TABLE "Plot" DROP COLUMN "size";
ALTER TABLE "Plot" DROP COLUMN "block";

-- AlterTable: add client address and date of membership
ALTER TABLE "Client" ADD COLUMN "address" TEXT;
ALTER TABLE "Client" ADD COLUMN "membershipDate" TIMESTAMP(3);
