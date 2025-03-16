import { Goal } from '../domain/goal';
import { GoalRepository } from '../domain/goalRepository';
import { PrismaRepositoryFactory } from '../infrastructure/prismaRepositoryFactory';

export class GoalService {
  private repository: GoalRepository;
  
  constructor(repository?: GoalRepository) {
    // Default to Prisma implementation if none provided
    this.repository = repository || PrismaRepositoryFactory.createGoalRepository();
  }
  
  async createGoal(goal: Goal): Promise<string> {
    await this.repository.save(goal);
    return goal.id!;
  }
  
  async updateGoal(goal: Goal): Promise<void> {
    await this.repository.save(goal);
  }
  
  async getGoalById(id: string): Promise<Goal | null> {
    return this.repository.findById(id);
  }
  
  async getGoalsByUserId(userId: string): Promise<Goal[]> {
    return this.repository.findByUserId(userId);
  }
  
  async deleteGoal(id: string): Promise<void> {
    await this.repository.delete(id);
  }
} 