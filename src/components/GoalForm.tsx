import React, { useState, useEffect } from 'react';
import { X, Repeat } from 'lucide-react';
import { Goal } from '../domain/goal';
import { RRuleConfig } from './RRuleConfig';
import { RRuleSetting } from '../domain/rrule';
import { useRRuleStore } from '../store/rruleStore';
import { RecurrenceForm } from './RecurrenceForm';
import { RecurrenceRule } from '../domain/recurrence';

interface GoalFormProps {
  goal?: Goal;
  onSubmit: (goalData: Partial<Goal>) => void;
  onClose: () => void;
}

export function GoalForm({ goal, onSubmit, onClose }: GoalFormProps) {
  const [title, setTitle] = useState(goal?.title || '');
  const [titleError, setTitleError] = useState('');
  const [showRRuleConfig, setShowRRuleConfig] = useState(false);
  const [rruleSetting, setRRuleSetting] = useState<RRuleSetting>();
  const [isRecurring, setIsRecurring] = useState(false);
  const [showRecurrenceForm, setShowRecurrenceForm] = useState(false);
  const [recurrenceRule, setRecurrenceRule] = useState<RecurrenceRule | undefined>();
  const [rruleString, setRruleString] = useState<string | undefined>();
  
  const { getRRule, saveRRule, deleteRRule } = useRRuleStore();

  useEffect(() => {
    if (goal?.rrule_setting_id) {
      getRRule(goal.rrule_setting_id).then(setting => {
        if (setting) setRRuleSetting(setting);
      });
    }
  }, [goal?.rrule_setting_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setTitleError('Title is required');
      return;
    }

    let rruleId = goal?.rrule_setting_id;
    
    if (rruleSetting) {
      if (rruleId) {
        // Update existing RRule setting
        await saveRRule(rruleSetting);
      } else {
        // Create new RRule setting
        rruleId = await saveRRule(rruleSetting);
      }
    } else if (rruleId) {
      // Remove RRule setting
      await deleteRRule(rruleId);
      rruleId = undefined;
    }
    
    const goalData: Partial<Goal> = {
      title: String(title.trim()),
      status: 'Not Started',
      rrule_setting_id: rruleId
    };

    onSubmit(goalData);
  };

  const handleRRuleChange = (setting: RRuleSetting | undefined) => {
    setRRuleSetting(setting);
    setShowRRuleConfig(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {goal ? 'Edit Goal' : 'Create New Goal'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              What's your goal? <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setTitleError('');
              }}
              className={`w-full p-2 border ${titleError ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
              placeholder="Enter your goal"
              required
            />
            {titleError && (
              <p className="mt-1 text-sm text-red-500">{titleError}</p>
            )}
          </div>

          <div className="flex items-center gap-2 mb-4">
            <input
              type="checkbox"
              id="isRecurring"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="w-4 h-4 text-purple-600"
            />
            <label htmlFor="isRecurring">Repeat this goal</label>
          </div>

          {isRecurring && !showRecurrenceForm && (
            <button
              type="button"
              onClick={() => setShowRecurrenceForm(true)}
              className="w-full p-3 border border-gray-200 rounded-lg text-left"
            >
              {recurrenceRule ? (
                <span>
                  {recurrenceRule.frequency} • Every {recurrenceRule.interval || 1} {recurrenceRule.interval === 1 ? recurrenceRule.frequency.slice(0, -2) : recurrenceRule.frequency}
                </span>
              ) : (
                <span>Set recurrence pattern</span>
              )}
            </button>
          )}

          {showRecurrenceForm && (
            <RecurrenceForm
              initialRule={recurrenceRule}
              startDate={goal?.targetDate || new Date()}
              onSave={(rrule, rule) => {
                setRruleString(rrule);
                setRecurrenceRule(rule);
                setShowRecurrenceForm(false);
              }}
              onCancel={() => setShowRecurrenceForm(false)}
            />
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              {goal ? 'Update Goal' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>

      {showRRuleConfig && (
        <RRuleConfig
          value={rruleSetting}
          onChange={handleRRuleChange}
          onClose={() => setShowRRuleConfig(false)}
        />
      )}
    </div>
  );
}