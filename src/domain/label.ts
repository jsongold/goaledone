export interface Label {
  id: string;
  name: string;
  color: string;
  userId?: string;
  createdAt: Date;
}

export interface LabelRepository {
  save(label: Label): Promise<void>;
  getAll(): Promise<Label[]>;
  delete(id: string): Promise<void>;
  update(id: string, updates: Partial<Omit<Label, 'id' | 'userId'>>): Promise<void>;
}