import { create } from 'zustand';
import { Label } from '../domain/label';
import { SupabaseLabelRepository } from '../infrastructure/supabaseLabelRepository';

interface LabelState {
  labels: Label[];
  loading: boolean;
  error: string | null;
  addLabel: (name: string, color: string) => Promise<void>;
  loadLabels: () => Promise<void>;
  deleteLabel: (id: string) => Promise<void>;
  updateLabel: (id: string, updates: Partial<Omit<Label, 'id' | 'userId'>>) => Promise<void>;
  setError: (error: string | null) => void;
}

const labelRepo = new SupabaseLabelRepository();

export const useLabelStore = create<LabelState>((set) => ({
  labels: [],
  loading: false,
  error: null,
  setError: (error) => set({ error }),
  addLabel: async (name: string, color: string) => {
    const label: Label = {
      id: crypto.randomUUID(),
      name,
      color,
      createdAt: new Date()
    };

    set({ loading: true, error: null });
    
    try {
      await labelRepo.save(label);
      set(state => ({
        labels: [...state.labels, label].sort((a, b) => a.name.localeCompare(b.name))
      }));
    } catch (error) {
      set({ error: 'Failed to save label' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  loadLabels: async () => {
    set({ loading: true, error: null });
    try {
      const labels = await labelRepo.getAll();
      set({ labels });
    } catch (error) {
      set({ error: 'Failed to load labels' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  deleteLabel: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await labelRepo.delete(id);
      set(state => ({
        labels: state.labels.filter(label => label.id !== id)
      }));
    } catch (error) {
      set({ error: 'Failed to delete label' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  updateLabel: async (id: string, updates: Partial<Omit<Label, 'id' | 'userId'>>) => {
    set({ loading: true, error: null });
    try {
      await labelRepo.update(id, updates);
      set(state => ({
        labels: state.labels.map(label =>
          label.id === id
            ? { ...label, ...updates }
            : label
        ).sort((a, b) => a.name.localeCompare(b.name))
      }));
    } catch (error) {
      set({ error: 'Failed to update label' });
      throw error;
    } finally {
      set({ loading: false });
    }
  }
}));