import { GoalRepository } from '../../src/domain/goalRepository';
import { SupabaseGoalRepository } from '../../src/infrastructure/supabaseGoalRepository';
import { Goal, RepeatConfig } from '../../src/domain/goal';
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
      // ... rest of the mock implementation
    })),
    rpc: jest.fn().mockResolvedValue({
      data: null,
      error: null
    })
  }))
}));

describe('SupabaseGoalRepository', () => {
  // ... test implementation remains the same
}); 