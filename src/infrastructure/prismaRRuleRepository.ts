import { PrismaClient } from '@prisma/client';
import { RRuleRepository } from '../domain/rruleRepository';
import { RRuleSetting } from '../domain/rruleSetting';

export class PrismaRRuleRepository implements RRuleRepository {
  private prisma: PrismaClient;
  
  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }
  
  async save(setting: RRuleSetting): Promise<string> {
    // Assuming we have an RRuleSetting table in the database
    const data = {
      id: setting.id,
      frequency: setting.frequency,
      interval: setting.interval,
      weekdays: setting.weekdays,
      until: setting.until,
      count: setting.count,
      bymonthday: setting.bymonthday,
      bymonth: setting.bymonth,
      byyearday: setting.byyearday,
      byweekno: setting.byweekno,
      bysetpos: setting.bysetpos,
      userId: setting.userId,
      createdAt: setting.createdAt || new Date()
    };
    
    if (setting.id) {
      // Update existing
      await this.prisma.rRuleSetting.update({
        where: { id: setting.id },
        data
      });
      return setting.id;
    } else {
      // Create new
      const result = await this.prisma.rRuleSetting.create({
        data
      });
      return result.id;
    }
  }
  
  async get(id: string): Promise<RRuleSetting | null> {
    const setting = await this.prisma.rRuleSetting.findUnique({
      where: { id }
    });
    
    if (!setting) return null;
    
    return {
      id: setting.id,
      frequency: setting.frequency,
      interval: setting.interval,
      weekdays: setting.weekdays,
      until: setting.until || undefined,
      count: setting.count || undefined,
      bymonthday: setting.bymonthday || undefined,
      bymonth: setting.bymonth || undefined,
      byyearday: setting.byyearday || undefined,
      byweekno: setting.byweekno || undefined,
      bysetpos: setting.bysetpos || undefined,
      userId: setting.userId,
      createdAt: setting.createdAt
    };
  }
} 