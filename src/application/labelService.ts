import { Label } from '../domain/label';
import { LabelRepository } from '../domain/labelRepository';
import { PrismaRepositoryFactory } from '../infrastructure/prismaRepositoryFactory';

export class LabelService {
  private repository: LabelRepository;
  
  constructor(repository?: LabelRepository) {
    this.repository = repository || PrismaRepositoryFactory.createLabelRepository();
  }
  
  async getLabels(userId: string): Promise<Label[]> {
    return this.repository.findByUserId(userId);
  }
  
  async getLabel(id: string): Promise<Label | null> {
    return this.repository.findById(id);
  }
  
  async createLabel(label: Label): Promise<string> {
    return this.repository.save(label);
  }
  
  async updateLabel(label: Label): Promise<string> {
    return this.repository.save(label);
  }
  
  async deleteLabel(id: string): Promise<void> {
    await this.repository.delete(id);
  }
} 