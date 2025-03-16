import { RRuleSetting } from './rruleSetting';

export interface RRuleRepository {
  save(setting: RRuleSetting): Promise<string>;
  get(id: string): Promise<RRuleSetting | null>;
} 