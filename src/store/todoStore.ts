import { create } from 'zustand';
import { Todo } from '../domain/todo';
import { SupabaseTodoRepository } from '../infrastructure/supabseTodoRepository';
import { startOfDay } from 'date-fns';

interface TodoState {
  todos: Todo[];
  loading: boolean;
  error: string | null;
  selectedDate: Date;
  addTodo: (description: string, plannedDate: Date) => Promise<void>;
  loadTodos: (date: Date) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  updateTodo: (id: string, updates: Partial<Omit<Todo, 'id' | 'userId'>>) => Promise<void>;
  setError: (error: string | null) => void;
  setSelectedDate: (date: Date) => void;
}

const todoRepo = new SupabaseTodoRepository();

export const useTodoStore = create<TodoState>((set) => ({
  todos: [],
  loading: false,
  error: null,
  selectedDate: new Date(),
  setError: (error) => set({ error }),
  setSelectedDate: (date) => {
    set({ selectedDate: date });
  },
  addTodo: async (description: string, plannedDate: Date) => {
    const todo: Todo = {
      id: crypto.randomUUID(),
      description,
      completed: false,
      createdAt: new Date(),
      plannedDate
    };

    set({ loading: true, error: null });
    
    try {
      await todoRepo.save(todo);
      set(state => ({
        todos: [...state.todos, todo]
      }));
    } catch (error) {
      set({ error: 'Failed to save todo' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  deleteTodo: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await todoRepo.delete(id);
      set(state => ({
        todos: state.todos.filter(todo => todo.id !== id)
      }));
    } catch (error) {
      set({ error: 'Failed to delete todo' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  updateTodo: async (id: string, updates: Partial<Omit<Todo, 'id' | 'userId'>>) => {
    set({ loading: true, error: null });
    try {
      await todoRepo.update(id, updates);
      set(state => ({
        todos: state.todos.map(todo =>
          todo.id === id
            ? { ...todo, ...updates }
            : todo
        )
      }));
    } catch (error) {
      set({ error: 'Failed to update todo' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  loadTodos: async (date: Date) => {
    set({ loading: true, error: null });
    try {
      const todos = await todoRepo.getTodosForDate(date);
      set({ todos });
    } catch (error) {
      set({ error: 'Failed to load todos' });
      throw error;
    } finally {
      set({ loading: false });
    }
  }
}));