import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  
  try {
    // Check database connection
    await prisma.$connect();
    console.log('Connected to database successfully');
    
    // Run any initialization logic here
    
    console.log('Database setup complete');
  } catch (error) {
    console.error('Database setup failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 