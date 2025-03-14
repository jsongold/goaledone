export interface Activity {
  id: string;
  timestamp: Date;
  description: string;
  duration: number; // in minutes
  category: string;
  notes?: string;
  userId?: string;
  labels: string[];
  is_deleted?: boolean;
}

export interface ActivityRepository {
  save(activity: Activity): Promise<void>;
  getActivitiesForDate(date: Date): Promise<Activity[]>;
  delete(id: string): Promise<void>;
  softDelete(id: string): Promise<void>;
  update(id: string, updates: Partial<Omit<Activity, 'id' | 'userId' | 'is_deleted'>>): Promise<void>;
  updateTime(id: string, timestamp: Date): Promise<void>;
  updateLabels(id: string, labels: string[]): Promise<void>;
}