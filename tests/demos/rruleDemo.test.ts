import { RRule, RRuleSet, Frequency } from 'rrule';
import { format } from 'date-fns';

// Similar to your application's RepeatConfig interface
interface RepeatConfig {
  enabled: boolean;
  weekdays?: string[];
  relativeDay?: {
    days: number;
    type: 'before_end' | 'after_beginning';
  };
}

// Helper function to convert your RepeatConfig to an RRule
function createRRuleFromConfig(config: RepeatConfig, startDate: Date, endDate?: Date): RRule | undefined {
  if (!config.enabled) return undefined;
  
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
    
    // For "before_end" types, you'd typically use UNTIL or another approach
    // This is simplified for the demo
  }
  
  return new RRule(options);
}

describe('RRule Demonstration', () => {
  // Common test dates
  const startDate = new Date('2023-05-01');
  const endDate = new Date('2023-05-31');
  
  test('Weekly recurrence on Monday, Wednesday, Friday', () => {
    const config: RepeatConfig = {
      enabled: true,
      weekdays: ['mon', 'wed', 'fri']
    };
    
    const rule = createRRuleFromConfig(config, startDate, endDate);
    console.log('RRULE String:', rule?.toString());
    
    // Get the next 10 occurrences
    const dates = rule?.all((date, i) => i < 10);
    
    // Format and display the dates
    const formattedDates = dates?.map(date => format(date, 'EEE, MMM d, yyyy'));
    console.log('Weekly MWF Occurrences:', formattedDates);
    
    expect(formattedDates).toContain('Mon, May 1, 2023');
    expect(formattedDates).toContain('Wed, May 3, 2023');
    expect(formattedDates).toContain('Fri, May 5, 2023');
  });
  
  test('Every 7 days recurrence', () => {
    const config: RepeatConfig = {
      enabled: true,
      relativeDay: {
        days: 7,
        type: 'after_beginning'
      }
    };
    
    const rule = createRRuleFromConfig(config, startDate, endDate);
    console.log('RRULE String:', rule?.toString());
    
    // Get the next 5 occurrences
    const dates = rule?.all((date, i) => i < 5);
    
    // Format and display the dates
    const formattedDates = dates?.map(date => format(date, 'EEE, MMM d, yyyy'));
    console.log('Every 7 days Occurrences:', formattedDates);
    
    expect(formattedDates).toContain('Mon, May 1, 2023');
    expect(formattedDates).toContain('Mon, May 8, 2023');
    expect(formattedDates).toContain('Mon, May 15, 2023');
  });
  
  test('Daily recurrence', () => {
    // Create a rule directly with RRule
    const rule = new RRule({
      freq: Frequency.DAILY,
      dtstart: startDate,
      count: 10 // Limit to 10 occurrences
    });
    
    console.log('Daily RRULE String:', rule.toString());
    
    // Get all occurrences (limited by count)
    const dates = rule.all();
    
    // Format and display the dates
    const formattedDates = dates.map(date => format(date, 'EEE, MMM d, yyyy'));
    console.log('Daily Occurrences:', formattedDates);
    
    expect(dates.length).toBe(10);
  });
  
  test('Monthly recurrence', () => {
    // 15th of each month
    const rule = new RRule({
      freq: Frequency.MONTHLY,
      dtstart: startDate,
      count: 5,
      bymonthday: 15
    });
    
    console.log('Monthly RRULE String:', rule.toString());
    
    // Get all occurrences
    const dates = rule.all();
    
    // Format and display the dates
    const formattedDates = dates.map(date => format(date, 'EEE, MMM d, yyyy'));
    console.log('Monthly (15th) Occurrences:', formattedDates);
    
    expect(formattedDates).toContain('Mon, May 15, 2023');
    expect(formattedDates).toContain('Thu, Jun 15, 2023');
  });
}); 