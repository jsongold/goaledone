import { PrismaClient } from '@prisma/client';
import { Activity, ActivityRepository } from '../domain/activity';
import { startOfDay, endOfDay } from 'date-fns';
import { Label } from '../domain/label';

const prisma = new PrismaClient();

export class PrismaActivityRepository implements ActivityRepository {
  async save(activity: Activity): Promise<void> {
    // Check if user is authenticated through your auth mechanism
    // This would depend on your auth implementation with Prisma
    
    await prisma.activity.create({
      data: {
        id: activity.id,
        userId: activity.userId,
        // Use only properties that exist on the Activity interface
        // Convert any optional fields with fallbacks as needed
        duration: activity.duration,
        lastUpdated: new Date(),
        isDeleted: false,
        // Add any other fields from your Activity model
      },
    });
  }

  async getActivitiesForDate(date: Date): Promise<Activity[]> {
    // Get authenticated user ID
    // This implementation depends on your auth strategy
    const userId = await this.getCurrentUserId();
    if (!userId) {
      console.error('No authenticated user found');
      return [];
    }

    const startDate = startOfDay(date);
    const endDate = endOfDay(date);

    const activities = await prisma.activity.findMany({
      where: {
        userId: userId,
        isDeleted: false,
        plannedDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return activities.map((activity: any) => ({
      id: activity.id,
      userId: activity.userId,
      // Map other fields based on your Activity interface
      duration: activity.duration,
      // Add other required properties from the Activity interface
    }));
  }

  async delete(id: string): Promise<void> {
    const userId = await this.getCurrentUserId();
    if (!userId) {
      throw new Error('User must be authenticated to delete activities');
    }

    await prisma.activity.delete({
      where: {
        id: id,
        userId: userId,
      },
    });
  }

  async softDelete(id: string): Promise<void> {
    const userId = await this.getCurrentUserId();
    if (!userId) {
      throw new Error('User must be authenticated to delete activities');
    }

    await prisma.activity.update({
      where: {
        id: id,
        userId: userId,
      },
      data: {
        isDeleted: true,
      },
    });
  }

  async update(id: string, updates: Partial<Omit<Activity, 'id' | 'userId' | 'isDeleted'>>): Promise<void> {
    const userId = await this.getCurrentUserId();
    if (!userId) {
      throw new Error('User must be authenticated to update activities');
    }

    const updateData: Record<string, any> = { ...updates };
    // Always update the lastUpdated timestamp
    updateData.lastUpdated = new Date();

    await prisma.activity.update({
      where: {
        id: id,
        userId: userId,
      },
      data: updateData,
    });
  }

  async updateProgress(id: string, progress: number): Promise<void> {
    // Make sure your Activity interface includes 'progress'
    await this.update(id, { progress });
  }

  // Add the missing methods required by ActivityRepository
  async updateTime(id: string, duration: number): Promise<void> {
    await this.update(id, { duration });
  }

  async updateLabels(id: string, labels: Label[]): Promise<void> {
    // Implement label updates - this depends on how labels are stored
    // This is a simplified implementation
    const labelIds = labels.map(label => label.id);
    
    // Update activity labels in your database
    // The exact implementation depends on your database schema
    await prisma.activityLabel.deleteMany({
      where: { activityId: id }
    });
    
    for (const labelId of labelIds) {
      await prisma.activityLabel.create({
        data: {
          activityId: id,
          labelId
        }
      });
    }
  }

  async getActivitiesForDateRange(startDate: Date, endDate: Date): Promise<Activity[]> {
    const userId = await this.getCurrentUserId();
    if (!userId) {
      console.error('No authenticated user found');
      return [];
    }

    const activities = await prisma.activity.findMany({
      where: {
        userId: userId,
        isDeleted: false,
        plannedDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        plannedDate: 'asc',
      },
    });

    return activities.map((activity: any) => ({
      id: activity.id,
      userId: activity.userId,
      // Map other properties based on your Activity interface
      duration: activity.duration,
      // Add other required properties from the Activity interface
    }));
  }

  // Helper method to get current user ID
  private async getCurrentUserId(): Promise<string | null> {
    try {
      const user = await prisma.user.findFirst({
        where: {
          // Add your authentication condition here
          // For example: token: session.token
        }
      });
      return user?.id || null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }
} 