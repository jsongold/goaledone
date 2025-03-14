import { createClient } from '@supabase/supabase-js';
import { Todo, TodoRepository } from '../domain/todo';
import { startOfDay, endOfDay } from 'date-fns';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

export class SupabaseTodoRepository implements TodoRepository {
  async save(todo: Todo): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated to save todos');
    }

    await supabase
      .from('todos')
      .insert([{
        id: todo.id,
        description: todo.description,
        completed: todo.completed,
        user_id: user.id,
        planned_date: todo.plannedDate.toISOString(),
        created_at: todo.createdAt.toISOString()
      }]);
  }

  async delete(id: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated to delete todos');
    }

    await supabase
      .from('todos')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
  }

  async update(id: string, updates: Partial<Omit<Todo, 'id' | 'userId'>>): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated to update todos');
    }

    const updateData: Record<string, any> = {};
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.completed !== undefined) updateData.completed = updates.completed;
    if (updates.plannedDate !== undefined) updateData.planned_date = updates.plannedDate.toISOString();

    await supabase
      .from('todos')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id);
  }

  async getTodosForDate(date: Date): Promise<Todo[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', user.id)
      .gte('planned_date', startOfDay(date).toISOString())
      .lte('planned_date', endOfDay(date).toISOString());

    if (error) {
      console.error('Error fetching todos:', error);
      return [];
    }

    return (data || []).map(todo => ({
      id: todo.id,
      description: todo.description,
      completed: todo.completed,
      userId: todo.user_id,
      createdAt: new Date(todo.created_at),
      plannedDate: new Date(todo.planned_date)
    }));
  }
}