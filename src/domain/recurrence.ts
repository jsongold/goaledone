import { RRule, RRuleSet, rrulestr } from 'rrule';

// Types for recurrence
export interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval?: number; // Default 1
  endDate?: Date | null;
  count?: number | null; // Number of occurrences
  byWeekday?: number[]; // 0 = Monday, 6 = Sunday
  byMonthDay?: number[]; // Days of month
}

export interface RecurringItemBase {
  id: string;
  rrule: string; // iCalendar RFC-5545 string format
  recurrenceRule?: RecurrenceRule; // Decoded version for UI
  originalDate: Date; // The first occurrence date
  lastProcessedDate?: Date; // Track for optimization
}

export function buildRRuleString(rule: RecurrenceRule, startDate: Date): string {
  const rruleOptions: any = {
    freq: RRule[rule.frequency.toUpperCase() as keyof typeof RRule],
    dtstart: startDate,
    interval: rule.interval || 1
  };

  if (rule.endDate) {
    rruleOptions.until = rule.endDate;
  }

  if (rule.count) {
    rruleOptions.count = rule.count;
  }

  if (rule.byWeekday && rule.byWeekday.length > 0) {
    rruleOptions.byweekday = rule.byWeekday.map(day => RRule.weekdays[day]);
  }

  if (rule.byMonthDay && rule.byMonthDay.length > 0) {
    rruleOptions.bymonthday = rule.byMonthDay;
  }

  return new RRule(rruleOptions).toString();
}

export function parseRRuleString(rruleString: string): RecurrenceRule {
  const rrule = rrulestr(rruleString);
  
  // Extract options from RRule object
  const options = (rrule as any).options;
  
  const frequency = Object.keys(RRule)
    .find(key => RRule[key as keyof typeof RRule] === options.freq)
    ?.toLowerCase() as RecurrenceRule['frequency'];

  return {
    frequency,
    interval: options.interval || 1,
    endDate: options.until || null,
    count: options.count || null,
    byWeekday: options.byweekday?.map((day: any) => day.weekday) || [],
    byMonthDay: options.bymonthday || []
  };
}

export function getOccurrences(rruleString: string, start: Date, end: Date): Date[] {
  const rrule = rrulestr(rruleString);
  return rrule.between(start, end, true);
} 