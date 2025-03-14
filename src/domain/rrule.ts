export type RRuleFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export interface RRuleSetting {
  id: string;
  frequency: RRuleFrequency;
  interval?: number;
  weekdays?: string[];
  until?: Date;
  count?: number;
  bymonthday?: number[];
  bymonth?: number[];
  byyearday?: number[];
  byweekno?: number[];
  bysetpos?: number[];
  userId?: string;
  createdAt: Date;
}

export interface RRuleRepository {
  save(setting: RRuleSetting): Promise<string>;
  get(id: string): Promise<RRuleSetting | null>;
  update(id: string, updates: Partial<Omit<RRuleSetting, 'id' | 'userId'>>): Promise<void>;
  delete(id: string): Promise<void>;
}