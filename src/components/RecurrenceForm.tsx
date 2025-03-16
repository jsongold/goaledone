import React, { useState } from 'react';
import { buildRRuleString, parseRRuleString, RecurrenceRule } from '../domain/recurrence';

interface RecurrenceFormProps {
  initialRule?: RecurrenceRule;
  startDate: Date;
  onSave: (rruleString: string, rule: RecurrenceRule) => void;
  onCancel: () => void;
}

export function RecurrenceForm({ initialRule, startDate, onSave, onCancel }: RecurrenceFormProps) {
  const [rule, setRule] = useState<RecurrenceRule>(initialRule || {
    frequency: 'daily',
    interval: 1,
    endDate: null,
    count: null,
    byWeekday: [],
  });

  const handleSave = () => {
    const rruleString = buildRRuleString(rule, startDate);
    onSave(rruleString, rule);
  };

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg shadow-md">
      <h3 className="font-medium text-lg">Repeat</h3>
      
      <div>
        <label className="block text-sm text-gray-700 mb-1">Frequency</label>
        <select
          value={rule.frequency}
          onChange={(e) => setRule({ ...rule, frequency: e.target.value as RecurrenceRule['frequency'] })}
          className="w-full p-2 border rounded-lg"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm text-gray-700 mb-1">Repeat every</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="1"
            value={rule.interval || 1}
            onChange={(e) => setRule({ ...rule, interval: parseInt(e.target.value) })}
            className="w-20 p-2 border rounded-lg"
          />
          <span>{rule.frequency === 'daily' ? 'days' : 
                 rule.frequency === 'weekly' ? 'weeks' : 
                 rule.frequency === 'monthly' ? 'months' : 'years'}</span>
        </div>
      </div>
      
      {rule.frequency === 'weekly' && (
        <div>
          <label className="block text-sm text-gray-700 mb-1">On these days</label>
          <div className="flex flex-wrap gap-2">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
              <button
                key={index}
                type="button"
                className={`w-8 h-8 rounded-full flex items-center justify-center 
                  ${rule.byWeekday?.includes(index) ? 'bg-purple-600 text-white' : 'bg-gray-100'}`}
                onClick={() => {
                  const newByWeekday = [...(rule.byWeekday || [])];
                  if (newByWeekday.includes(index)) {
                    const dayIndex = newByWeekday.indexOf(index);
                    newByWeekday.splice(dayIndex, 1);
                  } else {
                    newByWeekday.push(index);
                  }
                  setRule({ ...rule, byWeekday: newByWeekday });
                }}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      )}
      
      <div>
        <label className="block text-sm text-gray-700 mb-1">End</label>
        <div className="flex items-center gap-2 mb-2">
          <input
            type="radio"
            id="never"
            checked={!rule.endDate && !rule.count}
            onChange={() => setRule({ ...rule, endDate: null, count: null })}
          />
          <label htmlFor="never">Never</label>
        </div>
        
        <div className="flex items-center gap-2 mb-2">
          <input
            type="radio"
            id="after"
            checked={!!rule.count}
            onChange={() => setRule({ ...rule, count: 10, endDate: null })}
          />
          <label htmlFor="after">After</label>
          <input
            type="number"
            min="1"
            value={rule.count || ''}
            onChange={(e) => setRule({ ...rule, count: parseInt(e.target.value), endDate: null })}
            className="w-16 p-1 border rounded"
            disabled={!rule.count}
          />
          <span>occurrences</span>
        </div>
        
        <div className="flex items-center gap-2">
          <input
            type="radio"
            id="on-date"
            checked={!!rule.endDate}
            onChange={() => {
              const date = new Date();
              date.setMonth(date.getMonth() + 3);
              setRule({ ...rule, endDate: date, count: null });
            }}
          />
          <label htmlFor="on-date">On date</label>
          <input
            type="date"
            value={rule.endDate ? new Date(rule.endDate).toISOString().slice(0, 10) : ''}
            onChange={(e) => setRule({ ...rule, endDate: new Date(e.target.value), count: null })}
            className="p-1 border rounded"
            disabled={!rule.endDate}
          />
        </div>
      </div>
      
      <div className="flex justify-end gap-2 mt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Save
        </button>
      </div>
    </div>
  );
} 