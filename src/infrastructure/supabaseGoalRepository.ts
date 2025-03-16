import { createClient } from '@supabase/supabase-js';
import { Goal, GoalRepository } from '../domain/goal';
import { startOfDay, endOfDay } from 'date-fns';
import { getOccurrences } from '../domain/recurrence';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

export class SupabaseGoalRepository implements GoalRepository {
  async save(goal: Goal): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated to save goals');
    }

    const { error } = await supabase
      .from('goals')
      .insert([{
        id: goal.id,
        title: goal.title || '',
        description: goal.description || '',
        completed: Boolean(goal.completed),
        user_id: user.id,
        planned_date: goal.plannedDate.toISOString(),
        created_at: goal.createdAt.toISOString(),
        status: goal.status || 'Not Started',
        progress: goal.progress || 0,
        milestones: goal.milestones || [],
        last_updated: new Date().toISOString(),
        is_deleted: false,
        rrule_setting_id: goal.rrule_setting_id
      }]);

    if (error) {
      console.error('Error saving goal:', error);
      throw new Error('Failed to save goal');
    }
  }

  async getGoalsForDate(date: Date): Promise<Goal[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No authenticated user found');
      return [];
    }

    const startDate = startOfDay(date).toISOString();
    const endDate = endOfDay(date).toISOString();

    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_deleted', false)
      .gte('planned_date', startDate)
      .lte('planned_date', endDate)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching goals:', error);
      throw new Error('Failed to fetch goals');
    }

    return (data || []).map(goal => ({
      id: goal.id,
      title: goal.title || '',
      description: goal.description || '',
      completed: Boolean(goal.completed),
      userId: goal.user_id,
      createdAt: new Date(goal.created_at),
      plannedDate: new Date(goal.planned_date),
      status: goal.status || 'Not Started',
      progress: goal.progress || 0,
      milestones: goal.milestones || [],
      last_updated: new Date(goal.last_updated),
      is_deleted: goal.is_deleted,
      rrule_setting_id: goal.rrule_setting_id
    }));
  }

  async delete(id: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated to delete goals');
    }

    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting goal:', error);
      throw new Error('Failed to delete goal');
    }
  }

  async softDelete(id: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated to delete goals');
    }

    const { error } = await supabase
      .from('goals')
      .update({ is_deleted: true })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error soft deleting goal:', error);
      throw new Error('Failed to delete goal');
    }
  }

  async update(id: string, updates: Partial<Omit<Goal, 'id' | 'userId' | 'is_deleted'>>): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated to update goals');
    }

    const updateData: Record<string, any> = {};
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.completed !== undefined) updateData.completed = updates.completed;
    if (updates.plannedDate !== undefined) updateData.planned_date = updates.plannedDate.toISOString();
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.progress !== undefined) updateData.progress = updates.progress;
    if (updates.milestones !== undefined) updateData.milestones = updates.milestones;
    if (updates.rrule_setting_id !== undefined) updateData.rrule_setting_id = updates.rrule_setting_id;
    updateData.last_updated = new Date().toISOString();

    const { error } = await supabase
      .from('goals')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating goal:', error);
      throw new Error('Failed to update goal');
    }
  }

  async updateProgress(id: string, progress: number): Promise<void> {
    await this.update(id, { progress });
  }

  async updateMilestones(id: string, milestones: Goal['milestones']): Promise<void> {
    await this.update(id, { milestones });
  }

  async updateMetrics(id: string, metrics: Goal['target_metrics']): Promise<void> {
    await this.update(id, { target_metrics: metrics });
  }

  async generateRepeatingGoals(goal: Goal): Promise<void> {
    // Implementation for repeating goals
  }

  async getGoalsForDateRange(startDate: Date, endDate: Date): Promise<Goal[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No authenticated user found');
      return [];
    }

    // 1. Get all one-time goals that fall in the range
    const { data: oneTimeGoals, error: oneTimeError } = await supabase
      .from('goals')
      .select('*')
      .eq('userId', user.id)
      .is('isRecurring', false)
      .gte('targetDate', startDate.toISOString())
      .lte('targetDate', endDate.toISOString());
    
    if (oneTimeError) throw oneTimeError;
    
    // 2. Get all recurring goals
    const { data: recurringGoals, error: recurringError } = await supabase
      .from('goals')
      .select('*')
      .eq('userId', user.id)
      .eq('isRecurring', true)
      .is('recurrenceId', null); // Get parent definitions only
    
    if (recurringError) throw recurringError;
    
    // 3. Get exceptions (modified instances)
    const { data: exceptions, error: exceptionsError } = await supabase
      .from('goals')
      .select('*')
      .eq('userId', user.id)
      .eq('isException', true)
      .gte('targetDate', startDate.toISOString())
      .lte('targetDate', endDate.toISOString());
    
    if (exceptionsError) throw exceptionsError;
    
    // 4. Generate occurrences for recurring goals
    const generatedOccurrences: Goal[] = [];
    
    for (const recurringGoal of recurringGoals) {
      if (!recurringGoal.rrule) continue;
      
      // Get dates in the range that match the rule
      const occurrenceDates = getOccurrences(recurringGoal.rrule, startDate, endDate);
      
      // Create virtual instances for each date
      for (const date of occurrenceDates) {
        // Check if we have an exception for this date
        const exceptionForDate = exceptions.find(e => 
          e.recurrenceId === recurringGoal.id && 
          new Date(e.targetDate).toDateString() === date.toDateString()
        );
        
        // If we have an exception, use that instead
        if (exceptionForDate) {
          generatedOccurrences.push(exceptionForDate);
        } else {
          // Create a virtual instance
          generatedOccurrences.push({
            ...recurringGoal,
            id: `${recurringGoal.id}_${date.toISOString()}`, // Virtual ID
            targetDate: date,
            // Keep parent's isRecurring true but mark as a generated instance
            recurrenceId: recurringGoal.id
          });
        }
      }
    }
    
    // Combine one-time goals with generated occurrences
    return [...oneTimeGoals, ...generatedOccurrences];
  }
}