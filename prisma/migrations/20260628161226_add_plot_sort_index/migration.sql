-- AlterTable: add display order for plots (position in the official member list)
ALTER TABLE "Plot" ADD COLUMN "sortIndex" INTEGER NOT NULL DEFAULT 0;
