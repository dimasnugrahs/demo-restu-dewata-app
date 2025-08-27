// lib/db.js
import { PrismaClient } from "@prisma/client";

/**
 * @type {import("@prisma/client").PrismaClient}
 */
export const db = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalThis.prisma = db;
