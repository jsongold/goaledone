import { PrismaClient } from '@prisma/client';
import { PrismaGoalRepository } from './prismaGoalRepository';
import { PrismaGoalOccurrenceRepository } from './prismaGoalOccurrenceRepository';
import { PrismaRRuleRepository } from './prismaRRuleRepository';
import { PrismaLabelRepository } from './prismaLabelRepository';
import { GoalRepository } from '../domain/goalRepository';
import { GoalOccurrenceRepository } from '../domain/goalOccurrenceRepository';
import { RRuleRepository } from '../domain/rruleRepository';
import { LabelRepository } from '../domain/labelRepository';

// Singleton PrismaClient instance
const prisma = new PrismaClient();

export class PrismaRepositoryFactory {
  static createGoalRepository(): GoalRepository {
    return new PrismaGoalRepository(prisma);
  }
  
  static createGoalOccurrenceRepository(): GoalOccurrenceRepository {
    return new PrismaGoalOccurrenceRepository(prisma);
  }
  
  static createRRuleRepository(): RRuleRepository {
    return new PrismaRRuleRepository(prisma);
  }
  
  static createLabelRepository(): LabelRepository {
    return new PrismaLabelRepository(prisma);
  }
  
  static async disconnect(): Promise<void> {
    await prisma.$disconnect();
  }
} 