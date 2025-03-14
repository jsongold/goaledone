import { create } from 'zustand';
import { Goal } from '../domain/goal';
import { SupabaseGoalRepository } from '../infrastructure/supabaseGoalRepository';

interface GoalState {
  goals: Goal[];
  loading: boolean;
  error: string | null;
  selectedDate: Date;
  addGoal: (title: string, plannedDate: Date) => Promise<void>;
  loadGoals: (date: Date) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  updateGoal: (id: string, updates: Partial<Omit<Goal, 'id' | 'userId' | 'is_deleted'>>) => Promise<void>;
  setError: (error: string | null) => void;
  setSelectedDate: (date: Date) => void;
}

const goalRepo = new SupabaseGoalRepository();

export const useGoalStore = create<GoalState>((set) => ({
  goals: [],
  loading: false,
  error: null,
  selectedDate: new Date(),
  setError: (error) => set({ error }),
  setSelectedDate: (date) => {
    set({ selectedDate: date });
  },
  addGoal: async (title: string, plannedDate: Date) => {
    const goal: Goal = {
      id: crypto.randomUUID(),
      title: String(title || ''),
      description: '',
      completed: false,
      createdAt: new Date(),
      plannedDate: new Date(plannedDate),
      status: 'Not Started',
      progress: 0,
      milestones: [],
      last_updated: new Date(),
      is_deleted: false
    };

    set({ loading: true, error: null });
    
    try {
      await goalRepo.save(goal);
      set(state => ({
        goals: [...state.goals, goal],
        error: null
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save goal';
      set({ error: errorMessage });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  deleteGoal: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await goalRepo.softDelete(id);
      set(state => ({
        goals: state.goals.filter(goal => goal.id !== id),
        error: null
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete goal';
      set({ error: errorMessage });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  updateGoal: async (id: string, updates: Partial<Omit<Goal, 'id' | 'userId' | 'is_deleted'>>) => {
    set({ loading: true, error: null });
    try {
      await goalRepo.update(id, updates);
      set(state => ({
        goals: state.goals.map(goal =>
          goal.id === id
            ? { ...goal, ...updates }
            : goal
        ),
        error: null
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update goal';
      set({ error: errorMessage });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  loadGoals: async (date: Date) => {
    if (!date) {
      console.error('Invalid date provided to loadGoals');
      set({ error: 'Invalid date provided', goals: [] });
      return;
    }

    set({ loading: true, error: null });
    try {
      const goals = await goalRepo.getGoalsForDate(date);
      set({ goals, error: null });
    } catch (error) {
      console.error('Error loading goals:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load goals';
      set({ error: errorMessage, goals: [] });
    } finally {
      set({ loading: false });
    }
  }
}));