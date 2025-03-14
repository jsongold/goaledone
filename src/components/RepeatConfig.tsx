import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import { RepeatConfig } from '../domain/goal';

interface RepeatConfigInputProps {
  value: RepeatConfig | undefined;
  onChange: (config: RepeatConfig | undefined) => void;
}

const WEEKDAYS = [
  { id: 'mon', label: 'Monday' },
  { id: 'tue', label: 'Tuesday' },
  { id: 'wed', label: 'Wednesday' },
  { id: 'thu', label: 'Thursday' },
  { id: 'fri', label: 'Friday' },
  { id: 'sat', label: 'Saturday' },
  { id: 'sun', label: 'Sunday' }
];

const WEEKDAY_PRESETS = {
  everyday: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
  weekdays: ['mon', 'tue', 'wed', 'thu', 'fri'],
  weekend: ['sat', 'sun']
};

export function RepeatConfigInput({ value, onChange }: RepeatConfigInputProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tempConfig, setTempConfig] = useState<RepeatConfig>(
    value || { enabled: false }
  );
  const [relativeDays, setRelativeDays] = useState(
    value?.relativeDay?.days?.toString() || ''
  );

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setIsDialogOpen(true);
    } else {
      onChange(undefined);
    }
  };

  const handleLabelClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    const days = parseInt(relativeDays);
    if (relativeDays && (!Number.isInteger(days) || days < 1)) {
      return;
    }

    const newConfig: RepeatConfig = {
      ...tempConfig,
      enabled: true,
      relativeDay: relativeDays
        ? {
            days: parseInt(relativeDays),
            type: tempConfig.relativeDay?.type || 'after_beginning'
          }
        : undefined
    };

    onChange(newConfig);
    setIsDialogOpen(false);
  };

  const handleWeekdayToggle = (day: string) => {
    const currentWeekdays = tempConfig.weekdays || [];
    const newWeekdays = currentWeekdays.includes(day)
      ? currentWeekdays.filter(d => d !== day)
      : [...currentWeekdays, day];

    setTempConfig({
      ...tempConfig,
      enabled: true,
      weekdays: newWeekdays.length > 0 ? newWeekdays : undefined
    });
  };

  const handlePresetToggle = (preset: keyof typeof WEEKDAY_PRESETS) => {
    const currentWeekdays = tempConfig.weekdays || [];
    const presetDays = WEEKDAY_PRESETS[preset];
    
    const allPresetDaysSelected = presetDays.every(day => 
      currentWeekdays.includes(day)
    );

    const newWeekdays = allPresetDaysSelected
      ? currentWeekdays.filter(day => !presetDays.includes(day))
      : [...new Set([...currentWeekdays, ...presetDays])];

    setTempConfig({
      ...tempConfig,
      enabled: true,
      weekdays: newWeekdays.length > 0 ? newWeekdays : undefined
    });
  };

  return (
    <div className="mt-4">
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={value?.enabled || false}
          onChange={handleToggle}
          className="rounded text-purple-600"
          id="repeat-toggle"
        />
        <label 
          htmlFor="repeat-toggle"
          onClick={handleLabelClick}
          className="text-gray-500 hover:text-gray-700 cursor-pointer"
        >
          Repeat
        </label>
      </div>

      {isDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 shadow-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Repeat Configuration</h3>
              <button
                onClick={() => setIsDialogOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Weekday Selection */}
              <div>
                <h4 className="font-medium mb-2">Repeat on</h4>
                <div className="space-y-2">
                  <div className="flex gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handlePresetToggle('everyday')}
                      className={`px-3 py-1 rounded-full text-sm ${
                        WEEKDAY_PRESETS.everyday.every(day => 
                          tempConfig.weekdays?.includes(day)
                        )
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      Every day
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePresetToggle('weekdays')}
                      className={`px-3 py-1 rounded-full text-sm ${
                        WEEKDAY_PRESETS.weekdays.every(day => 
                          tempConfig.weekdays?.includes(day)
                        )
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      Weekdays
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePresetToggle('weekend')}
                      className={`px-3 py-1 rounded-full text-sm ${
                        WEEKDAY_PRESETS.weekend.every(day => 
                          tempConfig.weekdays?.includes(day)
                        )
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      Weekend
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {WEEKDAYS.map(day => (
                      <button
                        type="button"
                        key={day.id}
                        onClick={() => handleWeekdayToggle(day.id)}
                        className={`px-3 py-1 rounded-full text-sm ${
                          tempConfig.weekdays?.includes(day.id)
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Relative Day Selection */}
              <div>
                <h4 className="font-medium mb-2">Or repeat every</h4>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={relativeDays}
                    onChange={(e) => setRelativeDays(e.target.value)}
                    min="1"
                    placeholder="n"
                    className="w-20 p-2 border border-gray-300 rounded-lg"
                  />
                  <span className="text-gray-700">days</span>
                  <select
                    value={tempConfig.relativeDay?.type || 'after_beginning'}
                    onChange={(e) => setTempConfig({
                      ...tempConfig,
                      enabled: true,
                      relativeDay: {
                        days: parseInt(relativeDays) || 1,
                        type: e.target.value as 'before_end' | 'after_beginning'
                      }
                    })}
                    className="flex-1 p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="after_beginning">After beginning</option>
                    <option value="before_end">Before end</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setIsDialogOpen(false)}
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
      )}
    </div>
  );
}