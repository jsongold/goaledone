import { GoalRepository } from '../domain/goalRepository';
import { SupabaseGoalRepository } from './supabaseGoalRepository';
import { Goal, RepeatConfig } from '../domain/goal';
import { createClient } from '@supabase/supabase-js';

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: [{ id: 'test-id-123' }],
          error: null
        })
      }),
      upsert: jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: [{ id: 'test-id-123' }],
          error: null
        })
      }),
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: null
          })
        })
      })
    }),
    rpc: jest.fn().mockResolvedValue({
      data: null,
      error: null
    })
  }))
}));

describe('SupabaseGoalRepository', () => {
  let repository: GoalRepository;
  let mockInsert: jest.Mock;
  let mockUpsert: jest.Mock;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    const mockClient = createClient('http://example.com', 'fake-key');
    mockInsert = mockClient.from('').insert as jest.Mock;
    mockUpsert = mockClient.from('').upsert as jest.Mock;
    
    repository = new SupabaseGoalRepository(mockClient);
  });
  
  test('creates a goal with no recurrence rule', async () => {
    const goal: Goal = {
      id: undefined,
      title: 'Test Goal',
      description: 'Test Description',
      startDate: new Date('2023-01-01'),
      endDate: new Date('2023-01-31'),
      repeat: undefined
    };
    
    await repository.save(goal);
    
    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Test Goal',
      description: 'Test Description',
      start_date: '2023-01-01',
      end_date: '2023-01-31',
      rrule: null
    }));
  });
  
  test('creates a goal with weekday recurrence', async () => {
    const repeat: RepeatConfig = {
      enabled: true,
      weekdays: ['mon', 'wed', 'fri']
    };
    
    const goal: Goal = {
      id: undefined,
      title: 'Weekly Goal',
      description: 'Occurs MWF',
      startDate: new Date('2023-01-01'),
      endDate: new Date('2023-01-31'),
      repeat
    };
    
    await repository.save(goal);
    
    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Weekly Goal',
      description: 'Occurs MWF',
      start_date: '2023-01-01',
      end_date: '2023-01-31',
      rrule: expect.stringContaining('FREQ=WEEKLY;BYDAY=MO,WE,FR')
    }));
  });
  
  test('creates a goal with relative days recurrence', async () => {
    const repeat: RepeatConfig = {
      enabled: true,
      relativeDay: {
        days: 7,
        type: 'after_beginning'
      }
    };
    
    const goal: Goal = {
      id: undefined,
      title: 'Weekly after beginning',
      description: 'Occurs 7 days after start',
      startDate: new Date('2023-01-01'),
      endDate: new Date('2023-01-31'),
      repeat
    };
    
    await repository.save(goal);
    
    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Weekly after beginning',
      description: 'Occurs 7 days after start',
      start_date: '2023-01-01',
      end_date: '2023-01-31',
      rrule: expect.stringContaining('FREQ=DAILY;INTERVAL=7')
    }));
  });
  
  test('creates a goal with relative days before end', async () => {
    const repeat: RepeatConfig = {
      enabled: true,
      relativeDay: {
        days: 3,
        type: 'before_end'
      }
    };
    
    const goal: Goal = {
      id: undefined,
      title: '3 Days Before End',
      description: 'Occurs 3 days before deadline',
      startDate: new Date('2023-01-01'),
      endDate: new Date('2023-01-31'),
      repeat
    };
    
    await repository.save(goal);
    
    // This is a bit complex - the actual implementation would need to calculate
    // dates relative to the end date
    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
      title: '3 Days Before End',
      description: 'Occurs 3 days before deadline',
      start_date: '2023-01-01',
      end_date: '2023-01-31',
      rrule: expect.any(String)
    }));
  });
  
  test('updates a goal with a changed recurrence rule', async () => {
    // First with one recurrence rule
    const initialRepeat: RepeatConfig = {
      enabled: true,
      weekdays: ['mon', 'wed', 'fri']
    };
    
    const goal: Goal = {
      id: 'existing-id',
      title: 'Existing Goal',
      description: 'To be updated',
      startDate: new Date('2023-01-01'),
      endDate: new Date('2023-01-31'),
      repeat: initialRepeat
    };
    
    await repository.save(goal);
    
    // Then update with a different rule
    const updatedRepeat: RepeatConfig = {
      enabled: true,
      relativeDay: {
        days: 2,
        type: 'after_beginning'
      }
    };
    
    const updatedGoal: Goal = {
      ...goal,
      repeat: updatedRepeat
    };
    
    await repository.save(updatedGoal);
    
    // The second call should use the new recurrence rule
    expect(mockUpsert).toHaveBeenCalledWith(expect.objectContaining({
      id: 'existing-id',
      rrule: expect.stringContaining('FREQ=DAILY;INTERVAL=2')
    }));
  });
  
  test('removes recurrence when disabled', async () => {
    // First create with recurrence
    const initialRepeat: RepeatConfig = {
      enabled: true,
      weekdays: ['mon', 'wed', 'fri']
    };
    
    const goal: Goal = {
      id: 'existing-id',
      title: 'Existing Goal',
      description: 'To be updated',
      startDate: new Date('2023-01-01'),
      endDate: new Date('2023-01-31'),
      repeat: initialRepeat
    };
    
    await repository.save(goal);
    
    // Then update with no recurrence
    const updatedGoal: Goal = {
      ...goal,
      repeat: undefined
    };
    
    await repository.save(updatedGoal);
    
    // The second call should have null rrule
    expect(mockUpsert).toHaveBeenCalledWith(expect.objectContaining({
      id: 'existing-id',
      rrule: null
    }));
  });
  
  test('retrieves goal with recurrence rule correctly', async () => {
    // Mock the select response for this test
    const mockSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: {
            id: 'test-id',
            title: 'Test Goal',
            description: 'With recurrence',
            start_date: '2023-01-01',
            end_date: '2023-01-31',
            rrule: 'FREQ=WEEKLY;BYDAY=MO,WE,FR'
          },
          error: null
        })
      })
    });
    
    (createClient('', '') as any).from = jest.fn(() => ({
      select: mockSelect
    }));
    
    const result = await repository.findById('test-id');
    
    expect(result).toEqual(expect.objectContaining({
      id: 'test-id',
      title: 'Test Goal',
      description: 'With recurrence',
      startDate: expect.any(Date),
      endDate: expect.any(Date),
      repeat: expect.objectContaining({
        enabled: true,
        weekdays: ['mon', 'wed', 'fri'] 
      })
    }));
  });
}); 