import { SupabaseGoalRepository } from '../../src/infrastructure/supabaseGoalRepository';
import { Goal, RepeatConfig } from '../../src/domain/goal';
import { createClient } from '@supabase/supabase-js';
import { format } from 'date-fns';

// Mock tracking database writes
const dbWrites: any[] = [];

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn((table) => ({
      insert: jest.fn((record) => {
        dbWrites.push({ table, operation: 'insert', record });
        return {
          select: jest.fn().mockResolvedValue({
            data: [{ id: 'test-id-123', ...record }],
            error: null
          })
        };
      }),
      upsert: jest.fn((record) => {
        dbWrites.push({ table, operation: 'upsert', record });
        return {
          select: jest.fn().mockResolvedValue({
            data: [{ id: 'test-id-123', ...record }],
            error: null
          })
        };
      })
    })),
    rpc: jest.fn((func, params) => {
      // Mock the generate_occurrences function
      if (func === 'generate_occurrences') {
        // Get the rrule string from params
        const { rrule, start_date, end_date } = params;
        
        // This would typically be done by your database function
        // Here we're simulating what the database would do
        const occurrences = simulateOccurrenceGeneration(rrule, start_date, end_date);
        
        dbWrites.push({ 
          function: func, 
          params,
          generatedOccurrences: occurrences
        });
        
        return Promise.resolve({
          data: occurrences,
          error: null
        });
      }
      return Promise.resolve({ data: null, error: null });
    })
  }))
}));

// Helper to simulate occurrence generation (simplified version of what the DB would do)
function simulateOccurrenceGeneration(rruleString: string, startDate: string, endDate: string) {
  // In a real implementation, this would parse the RRule and generate all dates
  // For this test, we'll simulate some fixed dates based on the input
  
  const start = new Date(startDate);
  const end = new Date(endDate || new Date().setMonth(start.getMonth() + 1));
  
  // Check if we have a weekly Monday/Tuesday rule
  if (rruleString.includes('FREQ=WEEKLY') && 
      rruleString.includes('BYDAY=MO,TU')) {
    
    const occurrences = [];
    let currentDate = new Date(start);
    
    // Find first Monday or Tuesday
    while (currentDate <= end) {
      const day = currentDate.getDay();
      if (day === 1 || day === 2) { // 1 = Monday, 2 = Tuesday
        break;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Generate all Monday and Tuesday dates until end date
    while (currentDate <= end) {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      const dayOfWeek = currentDate.getDay();
      
      if (dayOfWeek === 1) { // Monday
        occurrences.push({
          id: `occ-${occurrences.length + 1}`,
          goal_id: 'test-id-123',
          occurrence_date: dateStr,
          is_completed: false,
          notes: null
        });
      } else if (dayOfWeek === 2) { // Tuesday
        occurrences.push({
          id: `occ-${occurrences.length + 1}`,
          goal_id: 'test-id-123',
          occurrence_date: dateStr,
          is_completed: false,
          notes: null
        });
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return occurrences;
  }
  
  return [];
}

describe('Goal Occurrence Database Integration', () => {
  beforeEach(() => {
    dbWrites.length = 0; // Clear tracking array
  });
  
  test('creates correct database records for Monday & Tuesday repeating goal', async () => {
    // Setup repository
    const mockClient = createClient('http://example.com', 'fake-key');
    const repository = new SupabaseGoalRepository(mockClient);
    
    // Create a goal with Monday & Tuesday recurrence
    const repeat: RepeatConfig = {
      enabled: true,
      weekdays: ['mon', 'tue']
    };
    
    const goal: Goal = {
      id: undefined,
      title: 'Bi-weekly Meeting',
      description: 'Monday and Tuesday meetings',
      startDate: new Date('2023-05-01'), // Monday
      endDate: new Date('2023-05-31'),
      repeat
    };
    
    // Save the goal
    await repository.save(goal);
    
    // Verify the goal was saved with correct RRule
    const goalInsert = dbWrites.find(write => 
      write.table === 'goals' && write.operation === 'insert'
    );
    
    console.log('Goal record in database:', goalInsert?.record);
    
    // Check that the RRule was created correctly
    expect(goalInsert?.record?.rrule).toContain('FREQ=WEEKLY');
    expect(goalInsert?.record?.rrule).toContain('BYDAY=MO,TU');
    
    // Check if occurrences were generated
    const occurrenceGeneration = dbWrites.find(write => 
      write.function === 'generate_occurrences'
    );
    
    // Display all the generated occurrences from the database
    if (occurrenceGeneration) {
      console.log('Generated occurrences:');
      console.table(
        occurrenceGeneration.generatedOccurrences.map((occ: any) => ({
          id: occ.id,
          date: occ.occurrence_date,
          completed: occ.is_completed
        }))
      );
    }
    
    // Verify there are occurrences for each Monday and Tuesday
    const occurrences = occurrenceGeneration?.generatedOccurrences || [];
    
    // Count how many Mondays should be in May 2023
    const mondaysInMay = [1, 8, 15, 22, 29]; // Mondays in May 2023
    const tuesdaysInMay = [2, 9, 16, 23, 30]; // Tuesdays in May 2023
    
    // Check we have the right number of occurrences
    expect(occurrences.length).toBe(mondaysInMay.length + tuesdaysInMay.length);
    
    // Check a few specific dates are included
    const occurrenceDates = occurrences.map((o: any) => o.occurrence_date);
    expect(occurrenceDates).toContain('2023-05-01'); // First Monday
    expect(occurrenceDates).toContain('2023-05-02'); // First Tuesday
    expect(occurrenceDates).toContain('2023-05-30'); // Last Tuesday
  });
}); 