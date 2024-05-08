/*
  Warnings:

  - Added the required column `dispname` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `User` ADD COLUMN `dispname` VARCHAR(191) NOT NULL;
