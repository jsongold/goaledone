import { Label } from './label';

export interface LabelRepository {
  findById(id: string): Promise<Label | null>;
  findByUserId(userId: string): Promise<Label[]>;
  save(label: Label): Promise<string>;
  delete(id: string): Promise<void>;
} 