import { PrismaClient } from '@prisma/client';
import { GoalOccurrenceRepository } from '../domain/goalOccurrenceRepository';
import { GoalOccurrence } from '../domain/goalOccurrence';

export class PrismaGoalOccurrenceRepository implements GoalOccurrenceRepository {
  private prisma: PrismaClient;
  
  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }
  
  async findByGoalId(goalId: string): Promise<GoalOccurrence[]> {
    const occurrences = await this.prisma.goalOccurrence.findMany({
      where: { goalId },
      orderBy: { date: 'asc' }
    });
    
    return occurrences.map(occurrence => ({
      id: occurrence.id,
      goalId: occurrence.goalId,
      date: occurrence.date,
      completed: occurrence.completed,
      notes: occurrence.notes || undefined
    }));
  }
  
  async updateCompletionStatus(id: string, completed: boolean): Promise<void> {
    await this.prisma.goalOccurrence.update({
      where: { id },
      data: { completed }
    });
  }
  
  async updateNotes(id: string, notes: string | null): Promise<void> {
    await this.prisma.goalOccurrence.update({
      where: { id },
      data: { notes }
    });
  }
  
  async findByDateRange(startDate: Date, endDate: Date): Promise<GoalOccurrence[]> {
    const occurrences = await this.prisma.goalOccurrence.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        goal: true // Include goal details if needed
      },
      orderBy: {
        date: 'asc'
      }
    });
    
    return occurrences.map(occurrence => ({
      id: occurrence.id,
      goalId: occurrence.goalId,
      date: occurrence.date,
      completed: occurrence.completed,
      notes: occurrence.notes || undefined,
      goal: {
        id: occurrence.goal.id,
        title: occurrence.goal.title,
        description: occurrence.goal.description || '',
        startDate: occurrence.goal.startDate,
        endDate: occurrence.goal.endDate || undefined,
        userId: occurrence.goal.userId
      }
    }));
  }
  
  async delete(id: string): Promise<void> {
    await this.prisma.goalOccurrence.delete({
      where: { id }
    });
  }
} 