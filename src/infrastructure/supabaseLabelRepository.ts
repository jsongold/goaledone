import { createClient } from '@supabase/supabase-js';
import { Label, LabelRepository } from '../domain/label';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

export class SupabaseLabelRepository implements LabelRepository {
  async save(label: Label): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated to save labels');
    }

    // First check if a label with the same name exists
    const { data: existingLabels } = await supabase
      .from('labels')
      .select('id')
      .eq('user_id', user.id)
      .eq('name', label.name)
      .maybeSingle();

    if (existingLabels) {
      // If label exists, update its color instead of creating a new one
      await supabase
        .from('labels')
        .update({ color: label.color })
        .eq('id', existingLabels.id)
        .eq('user_id', user.id);
      return;
    }

    // If label doesn't exist, create a new one
    await supabase
      .from('labels')
      .insert([{
        id: label.id,
        name: label.name,
        color: label.color,
        user_id: user.id,
        created_at: label.createdAt.toISOString()
      }]);
  }

  async getAll(): Promise<Label[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from('labels')
      .select('*')
      .eq('user_id', user.id)
      .order('name');

    if (error) {
      console.error('Error fetching labels:', error);
      return [];
    }

    return (data || []).map(label => ({
      id: label.id,
      name: label.name,
      color: label.color,
      userId: label.user_id,
      createdAt: new Date(label.created_at)
    }));
  }

  async delete(id: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated to delete labels');
    }

    await supabase
      .from('labels')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
  }

  async update(id: string, updates: Partial<Omit<Label, 'id' | 'userId'>>): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated to update labels');
    }

    // If updating the name, check for duplicates first
    if (updates.name !== undefined) {
      const { data: existingLabels } = await supabase
        .from('labels')
        .select('id')
        .eq('user_id', user.id)
        .eq('name', updates.name)
        .neq('id', id)
        .maybeSingle();

      if (existingLabels) {
        throw new Error('A label with this name already exists');
      }
    }

    const updateData: Record<string, any> = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.color !== undefined) updateData.color = updates.color;

    await supabase
      .from('labels')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id);
  }
}