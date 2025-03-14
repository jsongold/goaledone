import React, { useState } from 'react';
import { X } from 'lucide-react';
import { RRuleFrequency, RRuleSetting } from '../domain/rrule';

interface RRuleConfigProps {
  value?: RRuleSetting;
  onChange: (setting: RRuleSetting | undefined) => void;
  onClose: () => void;
}

const WEEKDAYS = [
  { id: 'MO', label: 'Monday' },
  { id: 'TU', label: 'Tuesday' },
  { id: 'WE', label: 'Wednesday' },
  { id: 'TH', label: 'Thursday' },
  { id: 'FR', label: 'Friday' },
  { id: 'SA', label: 'Saturday' },
  { id: 'SU', label: 'Sunday' }
];

const FREQUENCIES: { id: RRuleFrequency; label: string }[] = [
  { id: 'DAILY', label: 'Daily' },
  { id: 'WEEKLY', label: 'Weekly' },
  { id: 'MONTHLY', label: 'Monthly' },
  { id: 'YEARLY', label: 'Yearly' }
];

export function RRuleConfig({ value, onChange, onClose }: RRuleConfigProps) {
  const [frequency, setFrequency] = useState<RRuleFrequency>(value?.frequency || 'DAILY');
  const [interval, setInterval] = useState(value?.interval?.toString() || '1');
  const [weekdays, setWeekdays] = useState<string[]>(value?.weekdays || []);
  const [count, setCount] = useState(value?.count?.toString() || '');
  const [until, setUntil] = useState(value?.until ? new Date(value.until) : undefined);

  const handleSave = () => {
    const setting: RRuleSetting = {
      id: value?.id || crypto.randomUUID(),
      frequency,
      interval: parseInt(interval) || 1,
      weekdays: weekdays.length > 0 ? weekdays : undefined,
      count: count ? parseInt(count) : undefined,
      until,
      createdAt: value?.createdAt || new Date()
    };

    onChange(setting);
  };

  const handleWeekdayToggle = (day: string) => {
    setWeekdays(current =>
      current.includes(day)
        ? current.filter(d => d !== day)
        : [...current, day]
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 shadow-lg max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Repeat Configuration</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Frequency Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Repeat every
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={interval}
                onChange={(e) => setInterval(e.target.value)}
                min="1"
                className="w-20 p-2 border border-gray-300 rounded-lg"
              />
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as RRuleFrequency)}
                className="flex-1 p-2 border border-gray-300 rounded-lg"
              >
                {FREQUENCIES.map(freq => (
                  <option key={freq.id} value={freq.id}>{freq.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Weekday Selection (for weekly frequency) */}
          {frequency === 'WEEKLY' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Repeat on
              </label>
              <div className="grid grid-cols-2 gap-2">
                {WEEKDAYS.map(day => (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => handleWeekdayToggle(day.id)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      weekdays.includes(day.id)
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* End Condition */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ends
            </label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={count}
                  onChange={(e) => {
                    setCount(e.target.value);
                    setUntil(undefined);
                  }}
                  placeholder="After n occurrences"
                  className="flex-1 p-2 border border-gray-300 rounded-lg"
                  min="1"
                />
                <span className="text-gray-600">times</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={until ? until.toISOString().split('T')[0] : ''}
                  onChange={(e) => {
                    setUntil(e.target.value ? new Date(e.target.value) : undefined);
                    setCount('');
                  }}
                  className="flex-1 p-2 border border-gray-300 rounded-lg"
                />
                <span className="text-gray-600">on date</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
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
    </div>
  );
}