/*
  Warnings:

  - Added the required column `linkedBy` to the `Client` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "linkedBy" TEXT NOT NULL DEFAULT 'seed-script';

-- Drop the default once existing rows are backfilled; new inserts must
-- always pass linkedBy explicitly going forward.
ALTER TABLE "Client" ALTER COLUMN "linkedBy" DROP DEFAULT;
