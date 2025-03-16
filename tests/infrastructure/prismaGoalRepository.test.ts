import { PrismaClient } from '@prisma/client';
import { PrismaGoalRepository } from '../../src/infrastructure/prismaGoalRepository';
import { Goal, RepeatConfig } from '../../src/domain/goal';

// Mock tracking database operations
const dbOperations: any[] = [];

// Mock PrismaClient
jest.mock('@prisma/client', () => {
  const mockPrismaClient = jest.fn().mockImplementation(() => ({
    goal: {
      create: jest.fn((data) => {
        dbOperations.push({ table: 'goal', operation: 'create', data: data.data });
        return Promise.resolve({ id: 'mock-goal-id', ...data.data });
      }),
      update: jest.fn((data) => {
        dbOperations.push({ table: 'goal', operation: 'update', data: data.data, where: data.where });
        return Promise.resolve({ id: data.where.id, ...data.data });
      }),
      findUnique: jest.fn((data) => {
        dbOperations.push({ table: 'goal', operation: 'findUnique', where: data.where });
        return Promise.resolve(data.where.id === 'existing-id' ? {
          id: 'existing-id',
          title: 'Test Goal',
          description: 'Test Description',
          startDate: new Date('2023-01-01'),
          endDate: new Date('2023-01-31'),
          userId: 'test-user',
          rrule: 'FREQ=WEEKLY;BYDAY=MO,WE,FR'
        } : null);
      }),
      findMany: jest.fn((data) => {
        dbOperations.push({ table: 'goal', operation: 'findMany', where: data.where });
        return Promise.resolve([
          {
            id: 'goal-1',
            title: 'Goal 1',
            description: 'Description 1',
            startDate: new Date('2023-01-01'),
            endDate: new Date('2023-01-31'),
            userId: data.where.userId,
            rrule: null
          },
          {
            id: 'goal-2',
            title: 'Goal 2',
            description: 'Description 2',
            startDate: new Date('2023-02-01'),
            endDate: new Date('2023-02-28'),
            userId: data.where.userId,
            rrule: 'FREQ=WEEKLY;BYDAY=MO,WE,FR'
          }
        ]);
      }),
      delete: jest.fn((data) => {
        dbOperations.push({ table: 'goal', operation: 'delete', where: data.where });
        return Promise.resolve({ id: data.where.id });
      })
    },
    goalOccurrence: {
      createMany: jest.fn((data) => {
        dbOperations.push({ table: 'goalOccurrence', operation: 'createMany', data: data.data });
        return Promise.resolve({ count: data.data.length });
      }),
      deleteMany: jest.fn((data) => {
        dbOperations.push({ table: 'goalOccurrence', operation: 'deleteMany', where: data.where });
        return Promise.resolve({ count: 5 }); // Mock deleted count
      })
    },
    $transaction: jest.fn((callback) => {
      return callback({
        goal: {
          create: jest.fn((data) => {
            dbOperations.push({ table: 'goal', operation: 'create', data: data.data });
            return Promise.resolve({ id: 'mock-goal-id', ...data.data });
          }),
          update: jest.fn((data) => {
            dbOperations.push({ table: 'goal', operation: 'update', data: data.data, where: data.where });
            return Promise.resolve({ id: data.where.id, ...data.data });
          }),
        },
        goalOccurrence: {
          createMany: jest.fn((data) => {
            dbOperations.push({ table: 'goalOccurrence', operation: 'createMany', data: data.data });
            return Promise.resolve({ count: data.data.length });
          }),
          deleteMany: jest.fn((data) => {
            dbOperations.push({ table: 'goalOccurrence', operation: 'deleteMany', where: data.where });
            return Promise.resolve({ count: 5 });
          })
        }
      });
    }),
    $disconnect: jest.fn()
  }));
  
  return { PrismaClient: mockPrismaClient };
});

describe('PrismaGoalRepository', () => {
  let repository: PrismaGoalRepository;
  
  beforeEach(() => {
    dbOperations.length = 0;
    jest.clearAllMocks();
    
    const prisma = new PrismaClient();
    repository = new PrismaGoalRepository(prisma);
  });
  
  test('saves a new goal with no recurrence', async () => {
    const goal: Goal = {
      title: 'New Goal',
      description: 'Test Description',
      startDate: new Date('2023-01-01'),
      endDate: new Date('2023-01-31'),
      userId: 'test-user'
    };
    
    await repository.save(goal);
    
    const createOp = dbOperations.find(op => 
      op.table === 'goal' && op.operation === 'create'
    );
    
    expect(createOp).toBeDefined();
    expect(createOp.data.title).toBe('New Goal');
    expect(createOp.data.rrule).toBeNull();
  });
  
  test('saves a goal with weekly recurrence', async () => {
    const goal: Goal = {
      title: 'Weekly Goal',
      description: 'MWF Goal',
      startDate: new Date('2023-01-01'),
      endDate: new Date('2023-01-31'),
      userId: 'test-user',
      repeat: {
        enabled: true,
        weekdays: ['mon', 'wed', 'fri']
      }
    };
    
    await repository.save(goal);
    
    const createOp = dbOperations.find(op => 
      op.table === 'goal' && op.operation === 'create'
    );
    
    expect(createOp).toBeDefined();
    expect(createOp.data.rrule).toContain('FREQ=WEEKLY');
    expect(createOp.data.rrule).toContain('BYDAY=MO,WE,FR');
    
    // Check if occurrences were generated
    const occurrenceOp = dbOperations.find(op => 
      op.table === 'goalOccurrence' && op.operation === 'createMany'
    );
    
    expect(occurrenceOp).toBeDefined();
  });
  
  test('retrieves a goal by ID with repeat config', async () => {
    const goal = await repository.findById('existing-id');
    
    expect(goal).toBeDefined();
    expect(goal?.title).toBe('Test Goal');
    expect(goal?.repeat).toBeDefined();
    expect(goal?.repeat?.enabled).toBe(true);
    expect(goal?.repeat?.weekdays).toContain('mon');
    expect(goal?.repeat?.weekdays).toContain('wed');
    expect(goal?.repeat?.weekdays).toContain('fri');
  });
  
  test('retrieves goals by user ID', async () => {
    const goals = await repository.findByUserId('test-user');
    
    expect(goals).toHaveLength(2);
    expect(goals[0].id).toBe('goal-1');
    expect(goals[1].id).toBe('goal-2');
    expect(goals[1].repeat).toBeDefined();
    expect(goals[1].repeat?.weekdays).toContain('mon');
  });
  
  test('deletes a goal', async () => {
    await repository.delete('goal-to-delete');
    
    const deleteOp = dbOperations.find(op => 
      op.table === 'goal' && op.operation === 'delete'
    );
    
    expect(deleteOp).toBeDefined();
    expect(deleteOp.where.id).toBe('goal-to-delete');
  });
}); 