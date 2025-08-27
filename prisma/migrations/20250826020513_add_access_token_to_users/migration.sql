/*
  Warnings:

  - Added the required column `access_token` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "access_token" TEXT NOT NULL;
