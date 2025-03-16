import { createClient } from '@supabase/supabase-js';
import { Activity, ActivityRepository } from '../domain/activity';
import { startOfDay, endOfDay } from 'date-fns';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

export class SupabaseActivityRepository implements ActivityRepository {
  async save(activity: Activity): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated to save activities');
    }

    // First, insert the activity
    const { error: activityError } = await supabase
      .from('activities')
      .insert([{
        id: activity.id,
        timestamp: activity.timestamp.toISOString(),
        description: activity.description,
        duration: activity.duration,
        category: activity.category,
        notes: activity.notes,
        user_id: user.id,
        is_deleted: false
      }]);

    if (activityError) throw activityError;

    // Then, if there are labels, verify they exist and insert the relationships
    if (activity.labels && activity.labels.length > 0) {
      const { data: validLabels, error: labelCheckError } = await supabase
        .from('labels')
        .select('id')
        .eq('user_id', user.id)
        .in('id', activity.labels);

      if (labelCheckError) throw labelCheckError;

      const validLabelIds = validLabels.map(label => label.id);
      if (validLabelIds.length > 0) {
        const { error: labelError } = await supabase
          .from('activity_labels')
          .insert(
            validLabelIds.map(labelId => ({
              activity_id: activity.id,
              label_id: labelId
            }))
          );

        if (labelError) throw labelError;
      }
    }
  }

  async delete(id: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated to delete activities');
    }

    await supabase
      .from('activities')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
  }

  async softDelete(id: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated to delete activities');
    }

    await supabase
      .from('activities')
      .update({ is_deleted: true })
      .eq('id', id)
      .eq('user_id', user.id);
  }

  async update(id: string, updates: Partial<Omit<Activity, 'id' | 'userId' | 'is_deleted'>>): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated to update activities');
    }

    // Get current activity data
    const { data: currentActivity } = await supabase
      .from('activities')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (!currentActivity) {
      throw new Error('Activity not found');
    }

    // Only update fields that have changed
    const updateData: Record<string, any> = {};
    if (updates.description !== undefined && updates.description !== currentActivity.description) {
      updateData.description = String(updates.description);
    }
    if (updates.duration !== undefined && updates.duration !== currentActivity.duration) {
      updateData.duration = Number(updates.duration);
    }
    if (updates.category !== undefined && updates.category !== currentActivity.category) {
      updateData.category = String(updates.category);
    }
    if (updates.notes !== undefined && updates.notes !== currentActivity.notes) {
      updateData.notes = String(updates.notes);
    }
    if (updates.timestamp !== undefined) {
      const newTimestamp = new Date(updates.timestamp).toISOString();
      if (newTimestamp !== currentActivity.timestamp) {
        updateData.timestamp = newTimestamp;
      }
    }

    // Only perform update if there are changes
    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await supabase
        .from('activities')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id);

      if (updateError) throw updateError;
    }

    // Update labels if they've changed
    if (updates.labels !== undefined) {
      await this.updateLabels(id, updates.labels);
    }
  }

  async updateTime(id: string, timestamp: Date): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated to update activity time');
    }

    const { error: updateError } = await supabase
      .from('activities')
      .update({ timestamp: timestamp.toISOString() })
      .eq('id', id)
      .eq('user_id', user.id);

    if (updateError) throw updateError;
  }

  async updateLabels(id: string, labels: string[]): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated to update activity labels');
    }

    // First, verify the activity exists and belongs to the user
    const { data: activity, error: activityError } = await supabase
      .from('activities')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (activityError || !activity) {
      throw new Error('Activity not found or access denied');
    }

    // Delete existing labels
    await supabase
      .from('activity_labels')
      .delete()
      .eq('activity_id', id);

    // If there are new labels to add, verify they exist and belong to the user
    if (labels.length > 0) {
      const { data: validLabels, error: labelCheckError } = await supabase
        .from('labels')
        .select('id')
        .eq('user_id', user.id)
        .in('id', labels);

      if (labelCheckError) throw labelCheckError;

      const validLabelIds = validLabels.map(label => label.id);
      if (validLabelIds.length > 0) {
        const { error: labelError } = await supabase
          .from('activity_labels')
          .insert(
            validLabelIds.map(labelId => ({
              activity_id: id,
              label_id: labelId
            }))
          );

        if (labelError) throw labelError;
      }
    }
  }

  async getActivitiesForDate(date: Date): Promise<Activity[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return [];
    }

    const { data: activities, error: activitiesError } = await supabase
      .from('activities')
      .select(`
        *,
        activity_labels (
          label_id
        )
      `)
      .eq('user_id', user.id)
      .eq('is_deleted', false)
      .gte('timestamp', startOfDay(date).toISOString())
      .lte('timestamp', endOfDay(date).toISOString())
      .order('timestamp', { ascending: true });

    if (activitiesError) {
      console.error('Error fetching activities:', activitiesError);
      return [];
    }

    return (activities || []).map(activity => ({
      id: activity.id,
      timestamp: new Date(activity.timestamp),
      description: String(activity.description || ''),
      duration: Number(activity.duration || 0),
      category: String(activity.category || 'Other'),
      notes: activity.notes ? String(activity.notes) : undefined,
      userId: activity.user_id,
      labels: activity.activity_labels?.map(al => al.label_id) || [],
      is_deleted: activity.is_deleted
    }));
  }
}