export type GoalStatus = 'Not Started' | 'In Progress' | 'Completed' | 'On Hold' | 'Cancelled';

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  due_date?: Date;
}

export interface TargetMetric {
  name: string;
  target: number;
  current: number;
  unit: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  userId?: string;
  createdAt: Date;
  plannedDate: Date;
  is_deleted?: boolean;
  target_metrics?: TargetMetric[];
  timeline_start?: Date;
  timeline_end?: Date;
  status: GoalStatus;
  progress: number;
  milestones: Milestone[];
  last_updated: Date;
  rrule_setting_id?: string;
}

export interface GoalRepository {
  save(goal: Goal): Promise<void>;
  getGoalsForDate(date: Date): Promise<Goal[]>;
  delete(id: string): Promise<void>;
  softDelete(id: string): Promise<void>;
  update(id: string, updates: Partial<Omit<Goal, 'id' | 'userId' | 'is_deleted' | 'last_updated'>>): Promise<void>;
  updateProgress(id: string, progress: number): Promise<void>;
  updateMilestones(id: string, milestones: Milestone[]): Promise<void>;
  updateMetrics(id: string, metrics: TargetMetric[]): Promise<void>;
  generateRepeatingGoals(goal: Goal): Promise<void>;
}