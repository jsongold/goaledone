export interface Todo {
  id: string;
  description: string;
  completed: boolean;
  userId?: string;
  createdAt: Date;
  plannedDate: Date;
}

export interface TodoRepository {
  save(todo: Todo): Promise<void>;
  getTodosForDate(date: Date): Promise<Todo[]>;
  delete(id: string): Promise<void>;
  update(id: string, updates: Partial<Omit<Todo, 'id' | 'userId'>>): Promise<void>;
}