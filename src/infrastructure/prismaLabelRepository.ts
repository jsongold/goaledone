import { PrismaClient } from '@prisma/client';
import { LabelRepository } from '../domain/labelRepository';
import { Label } from '../domain/label';
import { PrismaRepository } from './prismaRepository';

export class PrismaLabelRepository extends PrismaRepository<Label> implements LabelRepository {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }
  
  async findById(id: string): Promise<Label | null> {
    try {
      const label = await this.prisma.label.findUnique({
        where: { id }
      });
      
      if (!label) return null;
      
      return {
        id: label.id,
        name: label.name,
        color: label.color,
        userId: label.userId
      };
    } catch (error) {
      this.handleError(error);
    }
  }
  
  async findByUserId(userId: string): Promise<Label[]> {
    try {
      const labels = await this.prisma.label.findMany({
        where: { userId },
        orderBy: { name: 'asc' }
      });
      
      return labels.map(label => ({
        id: label.id,
        name: label.name,
        color: label.color,
        userId: label.userId
      }));
    } catch (error) {
      this.handleError(error);
    }
  }
  
  async save(label: Label): Promise<string> {
    try {
      if (label.id) {
        // Update existing label
        await this.prisma.label.update({
          where: { id: label.id },
          data: {
            name: label.name,
            color: label.color,
            userId: label.userId
          }
        });
        return label.id;
      } else {
        // Create new label
        const result = await this.prisma.label.create({
          data: {
            name: label.name,
            color: label.color,
            userId: label.userId
          }
        });
        return result.id;
      }
    } catch (error) {
      this.handleError(error);
    }
  }
  
  async delete(id: string): Promise<void> {
    try {
      await this.prisma.label.delete({
        where: { id }
      });
    } catch (error) {
      this.handleError(error);
    }
  }
} 