import { Activity, ActivityRepository } from '../domain/activity';
import { startOfDay, endOfDay } from 'date-fns';

export class LocalStorageActivityRepository implements ActivityRepository {
  private readonly STORAGE_KEY = 'activities';

  private getStoredActivities(): Activity[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored).map((activity: any) => ({
      ...activity,
      timestamp: new Date(activity.timestamp)
    }));
  }

  private saveActivities(activities: Activity[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(activities));
  }

  async save(activity: Activity): Promise<void> {
    const activities = this.getStoredActivities();
    activities.push(activity);
    this.saveActivities(activities);
  }

  async delete(id: string): Promise<void> {
    const activities = this.getStoredActivities();
    this.saveActivities(activities.filter(activity => activity.id !== id));
  }

  async update(id: string, description: string, labels: string[] = []): Promise<void> {
    const activities = this.getStoredActivities();
    this.saveActivities(
      activities.map(activity =>
        activity.id === id
          ? { ...activity, description, labels }
          : activity
      )
    );
  }

  async updateTime(id: string, timestamp: Date): Promise<void> {
    const activities = this.getStoredActivities();
    this.saveActivities(
      activities.map(activity =>
        activity.id === id
          ? { ...activity, timestamp }
          : activity
      )
    );
  }

  async updateLabels(id: string, labels: string[]): Promise<void> {
    const activities = this.getStoredActivities();
    this.saveActivities(
      activities.map(activity =>
        activity.id === id
          ? { ...activity, labels }
          : activity
      )
    );
  }

  async getActivitiesForDate(date: Date): Promise<Activity[]> {
    const activities = this.getStoredActivities();
    return activities.filter(activity => {
      const activityTime = activity.timestamp.getTime();
      return activityTime >= startOfDay(date).getTime() && 
             activityTime <= endOfDay(date).getTime();
    });
  }
}