import { createClient } from '@supabase/supabase-js';
import { Goal, GoalRepository } from '../domain/goal';
import { startOfDay, endOfDay } from 'date-fns';

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
}