import { GoalOccurrence } from '../domain/goalOccurrence';
import { GoalOccurrenceRepository } from '../domain/goalOccurrenceRepository';
import { PrismaRepositoryFactory } from '../infrastructure/prismaRepositoryFactory';

export class GoalOccurrenceService {
  private repository: GoalOccurrenceRepository;
  
  constructor(repository?: GoalOccurrenceRepository) {
    this.repository = repository || PrismaRepositoryFactory.createGoalOccurrenceRepository();
  }
  
  async getOccurrencesByGoalId(goalId: string): Promise<GoalOccurrence[]> {
    return this.repository.findByGoalId(goalId);
  }
  
  async markAsCompleted(id: string, completed: boolean): Promise<void> {
    await this.repository.updateCompletionStatus(id, completed);
  }
  
  async updateNotes(id: string, notes: string | null): Promise<void> {
    await this.repository.updateNotes(id, notes);
  }
  
  async getOccurrencesForCalendar(startDate: Date, endDate: Date): Promise<GoalOccurrence[]> {
    return this.repository.findByDateRange(startDate, endDate);
  }
} 