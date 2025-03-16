import { GoalOccurrence } from './goalOccurrence';

export interface GoalOccurrenceRepository {
  findByGoalId(goalId: string): Promise<GoalOccurrence[]>;
  updateCompletionStatus(id: string, completed: boolean): Promise<void>;
  updateNotes(id: string, notes: string | null): Promise<void>;
  findByDateRange(startDate: Date, endDate: Date): Promise<GoalOccurrence[]>;
  delete(id: string): Promise<void>;
} 