import { container } from 'tsyringe';
import { GoalRepository } from '../domain/goalRepository';
import { GoalOccurrenceRepository } from '../domain/goalOccurrenceRepository';
import { RRuleRepository } from '../domain/rruleRepository';
import { LabelRepository } from '../domain/labelRepository';
import { PrismaGoalRepository } from '../infrastructure/prismaGoalRepository';
import { PrismaGoalOccurrenceRepository } from '../infrastructure/prismaGoalOccurrenceRepository';
import { PrismaRRuleRepository } from '../infrastructure/prismaRRuleRepository';
import { PrismaLabelRepository } from '../infrastructure/prismaLabelRepository';
import { PrismaClient } from '@prisma/client';

// Register Prisma client
const prismaClient = new PrismaClient();
container.registerInstance(PrismaClient, prismaClient);

// Register repositories
container.registerSingleton<GoalRepository>(
  'GoalRepository',
  PrismaGoalRepository
);

container.registerSingleton<GoalOccurrenceRepository>(
  'GoalOccurrenceRepository',
  PrismaGoalOccurrenceRepository
);

container.registerSingleton<RRuleRepository>(
  'RRuleRepository',
  PrismaRRuleRepository
);

container.registerSingleton<LabelRepository>(
  'LabelRepository',
  PrismaLabelRepository
);

export { container }; 