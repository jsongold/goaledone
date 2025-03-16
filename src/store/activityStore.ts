import { create } from 'zustand';
import { Activity } from '../domain/activity';
import { SupabaseActivityRepository } from '../infrastructure/supabaseRepository';
import { startOfDay, endOfDay } from 'date-fns';

interface ActivityState {
  activities: Activity[];
  loading: boolean;
  error: string | null;
  selectedDate: Date;
  addActivity: (activity: Omit<Activity, 'id' | 'is_deleted'>) => Promise<void>;
  loadActivities: (date: Date) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;
  updateActivity: (id: string, updates: Partial<Omit<Activity, 'id' | 'userId' | 'is_deleted'>>) => Promise<void>;
  updateActivityTime: (id: string, timestamp: Date) => Promise<void>;
  updateActivityLabels: (id: string, labels: string[]) => Promise<void>;
  setError: (error: string | null) => void;
  setSelectedDate: (date: Date) => void;
}

const supabaseRepo = new SupabaseActivityRepository();

export const useActivityStore = create<ActivityState>((set) => ({
  activities: [],
  loading: false,
  error: null,
  selectedDate: new Date(),
  setError: (error) => set({ error }),
  setSelectedDate: (date) => {
    set({ selectedDate: date });
  },
  addActivity: async (activityData) => {
    const activity: Activity = {
      id: crypto.randomUUID(),
      description: String(activityData.description || ''),
      duration: Number(activityData.duration || 0),
      category: String(activityData.category || 'Other'),
      notes: activityData.notes ? String(activityData.notes) : undefined,
      timestamp: new Date(activityData.timestamp),
      labels: Array.isArray(activityData.labels) ? activityData.labels : [],
      is_deleted: false
    };

    set({ loading: true, error: null });
    
    try {
      await supabaseRepo.save(activity);
      set(state => ({
        activities: [...state.activities, activity]
      }));
    } catch (error) {
      set({ error: 'Failed to save activity' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  deleteActivity: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await supabaseRepo.softDelete(id);
      set(state => ({
        activities: state.activities.filter(activity => activity.id !== id)
      }));
    } catch (error) {
      set({ error: 'Failed to delete activity' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  updateActivity: async (id: string, updates) => {
    set({ loading: true, error: null });
    try {
      await supabaseRepo.update(id, updates);
      
      set(state => ({
        activities: state.activities.map(activity =>
          activity.id === id
            ? { ...activity, ...updates }
            : activity
        )
      }));
    } catch (error) {
      set({ error: 'Failed to update activity' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  updateActivityTime: async (id: string, timestamp: Date) => {
    set({ loading: true, error: null });
    try {
      await supabaseRepo.updateTime(id, timestamp);
      
      set(state => ({
        activities: state.activities.map(activity =>
          activity.id === id
            ? { ...activity, timestamp }
            : activity
        )
      }));
    } catch (error) {
      set({ error: 'Failed to update activity time' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  updateActivityLabels: async (id: string, labels: string[]) => {
    set({ loading: true, error: null });
    try {
      await supabaseRepo.updateLabels(id, labels);
      
      set(state => ({
        activities: state.activities.map(activity =>
          activity.id === id
            ? { ...activity, labels }
            : activity
        )
      }));
    } catch (error) {
      set({ error: 'Failed to update activity labels' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  loadActivities: async (date: Date) => {
    set({ loading: true, error: null });
    try {
      const activities = await supabaseRepo.getActivitiesForDate(date);
      set({ activities });
    } catch (error) {
      set({ error: 'Failed to load activities' });
      throw error;
    } finally {
      set({ loading: false });
    }
  }
}));