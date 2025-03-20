import { PrismaClient } from '@prisma/client';

// Use a singleton pattern for the PrismaClient
let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // Prevent multiple instances during development
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

export { prisma }; 