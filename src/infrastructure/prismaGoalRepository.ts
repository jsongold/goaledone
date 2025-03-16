import { PrismaClient } from '@prisma/client';
import { GoalRepository } from '../domain/goalRepository';
import { Goal, RepeatConfig } from '../domain/goal';
import { format } from 'date-fns';
import { RRule, Frequency } from 'rrule';

export class PrismaGoalRepository implements GoalRepository {
  private prisma: PrismaClient;
  
  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }
  
  async save(goal: Goal): Promise<void> {
    const { id, title, description, startDate, endDate, repeat, userId } = goal;
    
    // Convert RepeatConfig to RRule string
    const rrule = repeat?.enabled 
      ? this.createRRuleFromConfig(repeat, startDate)
      : null;
    
    await this.prisma.$transaction(async (tx) => {
      if (id) {
        // Update existing goal
        await tx.goal.update({
          where: { id },
          data: {
            title,
            description,
            startDate,
            endDate,
            rrule,
            userId
          }
        });
        
        // If rrule changed, regenerate occurrences
        if (rrule !== null) {
          // Delete existing occurrences
          await tx.goalOccurrence.deleteMany({
            where: { goalId: id }
          });
          
          // Generate new occurrences
          await this.generateOccurrences(tx, id, rrule, startDate, endDate);
        }
      } else {
        // Create new goal
        const createdGoal = await tx.goal.create({
          data: {
            title,
            description,
            startDate,
            endDate,
            rrule,
            userId
          }
        });
        
        // Generate occurrences if recurring
        if (rrule) {
          await this.generateOccurrences(tx, createdGoal.id, rrule, startDate, endDate);
        }
      }
    });
  }
  
  async findById(id: string): Promise<Goal | null> {
    const goal = await this.prisma.goal.findUnique({
      where: { id }
    });
    
    if (!goal) return null;
    
    // Convert database record to domain object
    return {
      id: goal.id,
      title: goal.title,
      description: goal.description || '',
      startDate: goal.startDate,
      endDate: goal.endDate || undefined,
      userId: goal.userId,
      repeat: goal.rrule ? this.parseRruleToConfig(goal.rrule) : undefined
    };
  }

  async findByUserId(userId: string): Promise<Goal[]> {
    const goals = await this.prisma.goal.findMany({
      where: { userId }
    });
    
    return goals.map(goal => ({
      id: goal.id,
      title: goal.title,
      description: goal.description || '',
      startDate: goal.startDate,
      endDate: goal.endDate || undefined,
      userId: goal.userId,
      repeat: goal.rrule ? this.parseRruleToConfig(goal.rrule) : undefined
    }));
  }
  
  async delete(id: string): Promise<void> {
    await this.prisma.goal.delete({
      where: { id }
    });
  }
  
  private async generateOccurrences(
    tx: any,
    goalId: string, 
    rruleString: string, 
    startDate: Date, 
    endDate?: Date
  ): Promise<void> {
    // Create an RRule instance
    const rule = RRule.fromString(rruleString);
    
    // Set end date to 1 year from start if not provided
    const end = endDate || new Date(startDate);
    if (!endDate) {
      end.setFullYear(end.getFullYear() + 1);
    }
    
    // Get all occurrences
    const dates = rule.between(startDate, end, true);
    
    // Create occurrence records
    if (dates.length > 0) {
      await tx.goalOccurrence.createMany({
        data: dates.map(date => ({
          goalId,
          date,
          completed: false
        }))
      });
    }
  }
  
  private createRRuleFromConfig(config: RepeatConfig, startDate: Date): string {
    const options: any = {
      dtstart: startDate
    };
    
    // Handle weekday-based recurrence
    if (config.weekdays && config.weekdays.length > 0) {
      options.freq = Frequency.WEEKLY;
      
      // Convert your weekday format to RRule format
      const weekdayMap: Record<string, number> = {
        mon: RRule.MO.weekday,
        tue: RRule.TU.weekday,
        wed: RRule.WE.weekday,
        thu: RRule.TH.weekday,
        fri: RRule.FR.weekday,
        sat: RRule.SA.weekday,
        sun: RRule.SU.weekday
      };
      
      options.byweekday = config.weekdays.map(day => weekdayMap[day]);
    }
    
    // Handle relative day recurrence
    if (config.relativeDay) {
      options.freq = Frequency.DAILY;
      options.interval = config.relativeDay.days;
      
      // If it's before_end type, we need more complex logic
      // For simplicity, we're not implementing that here
    }
    
    return new RRule(options).toString();
  }
  
  private parseRruleToConfig(rruleString: string): RepeatConfig {
    const config: RepeatConfig = {
      enabled: true
    };
    
    if (rruleString.includes('FREQ=WEEKLY')) {
      // Extract weekdays from BYDAY parameter
      const bydayMatch = rruleString.match(/BYDAY=([^;]*)/);
      if (bydayMatch) {
        const days = bydayMatch[1].split(',');
        const weekdays: string[] = [];
        
        if (days.includes('MO')) weekdays.push('mon');
        if (days.includes('TU')) weekdays.push('tue');
        if (days.includes('WE')) weekdays.push('wed');
        if (days.includes('TH')) weekdays.push('thu');
        if (days.includes('FR')) weekdays.push('fri');
        if (days.includes('SA')) weekdays.push('sat');
        if (days.includes('SU')) weekdays.push('sun');
        
        config.weekdays = weekdays;
      }
    } else if (rruleString.includes('FREQ=DAILY')) {
      // Extract interval for relative days
      const intervalMatch = rruleString.match(/INTERVAL=(\d+)/);
      if (intervalMatch) {
        config.relativeDay = {
          days: parseInt(intervalMatch[1]),
          type: 'after_beginning' // Default, would need more logic for before_end
        };
      }
    }
    
    return config;
  }
} 