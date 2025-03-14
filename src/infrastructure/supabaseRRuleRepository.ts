import { createClient } from '@supabase/supabase-js';
import { RRuleSetting, RRuleRepository } from '../domain/rrule';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

export class SupabaseRRuleRepository implements RRuleRepository {
  async save(setting: RRuleSetting): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated to save RRule settings');
    }

    const { data, error } = await supabase
      .from('rrule_settings')
      .insert([{
        frequency: setting.frequency,
        interval: setting.interval,
        weekdays: setting.weekdays,
        until: setting.until?.toISOString(),
        count: setting.count,
        bymonthday: setting.bymonthday,
        bymonth: setting.bymonth,
        byyearday: setting.byyearday,
        byweekno: setting.byweekno,
        bysetpos: setting.bysetpos,
        user_id: user.id
      }])
      .select()
      .single();

    if (error) throw error;
    return data.id;
  }

  async get(id: string): Promise<RRuleSetting | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('rrule_settings')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      frequency: data.frequency,
      interval: data.interval,
      weekdays: data.weekdays,
      until: data.until ? new Date(data.until) : undefined,
      count: data.count,
      bymonthday: data.bymonthday,
      bymonth: data.bymonth,
      byyearday: data.byyearday,
      byweekno: data.byweekno,
      bysetpos: data.bysetpos,
      userId: data.user_id,
      createdAt: new Date(data.created_at)
    };
  }

  async update(id: string, updates: Partial<Omit<RRuleSetting, 'id' | 'userId'>>): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated to update RRule settings');
    }

    const updateData: Record<string, any> = {};
    if (updates.frequency !== undefined) updateData.frequency = updates.frequency;
    if (updates.interval !== undefined) updateData.interval = updates.interval;
    if (updates.weekdays !== undefined) updateData.weekdays = updates.weekdays;
    if (updates.until !== undefined) updateData.until = updates.until.toISOString();
    if (updates.count !== undefined) updateData.count = updates.count;
    if (updates.bymonthday !== undefined) updateData.bymonthday = updates.bymonthday;
    if (updates.bymonth !== undefined) updateData.bymonth = updates.bymonth;
    if (updates.byyearday !== undefined) updateData.byyearday = updates.byyearday;
    if (updates.byweekno !== undefined) updateData.byweekno = updates.byweekno;
    if (updates.bysetpos !== undefined) updateData.bysetpos = updates.bysetpos;

    const { error } = await supabase
      .from('rrule_settings')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
  }

  async delete(id: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated to delete RRule settings');
    }

    const { error } = await supabase
      .from('rrule_settings')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
  }
}