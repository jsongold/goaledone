import { create } from 'zustand';
import { RRuleSetting } from '../domain/rrule';
import { SupabaseRRuleRepository } from '../infrastructure/supabaseRRuleRepository';

interface RRuleState {
  loading: boolean;
  error: string | null;
  saveRRule: (setting: RRuleSetting) => Promise<string>;
  getRRule: (id: string) => Promise<RRuleSetting | null>;
  updateRRule: (id: string, updates: Partial<Omit<RRuleSetting, 'id' | 'userId'>>) => Promise<void>;
  deleteRRule: (id: string) => Promise<void>;
  setError: (error: string | null) => void;
}

const rruleRepo = new SupabaseRRuleRepository();

export const useRRuleStore = create<RRuleState>((set) => ({
  loading: false,
  error: null,
  setError: (error) => set({ error }),
  saveRRule: async (setting) => {
    set({ loading: true, error: null });
    try {
      const id = await rruleRepo.save(setting);
      return id;
    } catch (error) {
      set({ error: 'Failed to save RRule setting' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  getRRule: async (id) => {
    set({ loading: true, error: null });
    try {
      return await rruleRepo.get(id);
    } catch (error) {
      set({ error: 'Failed to get RRule setting' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  updateRRule: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      await rruleRepo.update(id, updates);
    } catch (error) {
      set({ error: 'Failed to update RRule setting' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  deleteRRule: async (id) => {
    set({ loading: true, error: null });
    try {
      await rruleRepo.delete(id);
    } catch (error) {
      set({ error: 'Failed to delete RRule setting' });
      throw error;
    } finally {
      set({ loading: false });
    }
  }
}));