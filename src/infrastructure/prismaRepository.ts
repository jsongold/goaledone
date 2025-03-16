import { PrismaClient } from '@prisma/client';

export abstract class PrismaRepository<T> {
  protected prisma: PrismaClient;
  
  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }
  
  // Common methods can be implemented here
  protected handleError(error: any): never {
    // Log error or process it
    console.error('Database operation failed:', error);
    throw new Error(`Repository operation failed: ${error.message}`);
  }
} 