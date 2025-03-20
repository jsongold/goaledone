import React, { useState, useEffect, useCallback } from 'react';
import { format, addDays, startOfHour, addMinutes } from 'date-fns';
import { 
  Clock, Menu, LogOut, Calendar as CalendarIcon, 
  Trash2, ChevronLeft, ChevronRight, X, 
  ChevronUp, ChevronDown 
} from 'lucide-react';
import { useActivityStore } from '../store/activityStore';
import { useGoalStore } from '../store/goalStore';
import { useLabelStore } from '../store/labelStore';
import { CalendarModal } from './Calendar';
import { ActivityLabels } from './ActivityLabels';
import { ActionButtons } from './ActionButtons';
import { Activity } from '../domain/activity';

interface ActivityPageProps {
  onGoalClick: () => void;
  onSignOut: () => void;
}

const CATEGORIES = [
  'Exercise',
  'Work',
  'Leisure',
  'Study',
  'Social',
  'Health',
  'Chores',
  'Other'
];

const DEFAULT_DURATION = '10';
const DEFAULT_CATEGORY = 'Other';
const DEFAULT_DESCRIPTION = '';
const DEFAULT_NOTES = '';
const DEFAULT_LABELS: string[] = [];

function roundToNearestTenMinutes(date: Date): Date {
  const minutes = date.getMinutes();
  const roundedMinutes = Math.round(minutes / 10) * 10;
  return addMinutes(startOfHour(date), roundedMinutes);
}

export function ActivityPage({ onGoalClick, onSignOut }: ActivityPageProps) {
  const [description, setDescription] = useState(DEFAULT_DESCRIPTION);
  const [duration, setDuration] = useState(DEFAULT_DURATION);
  const [category, setCategory] = useState(DEFAULT_CATEGORY);
  const [notes, setNotes] = useState(DEFAULT_NOTES);
  const [activityTime, setActivityTime] = useState(roundToNearestTenMinutes(new Date()));
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedLabels, setSelectedLabels] = useState<string[]>(DEFAULT_LABELS);
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);

  const { activities, loading, error, addActivity, deleteActivity, updateActivity, loadActivities, selectedDate, setSelectedDate } = useActivityStore();
  const { goals, loadGoals } = useGoalStore();
  const { loadLabels } = useLabelStore();

  useEffect(() => {
    loadActivities(selectedDate);
    loadGoals(selectedDate);
    loadLabels();
  }, [selectedDate, loadActivities, loadGoals, loadLabels]);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (isFormOpen && !target.closest('.activity-form') && !target.closest('.add-button')) {
      setIsFormOpen(false);
      resetForm();
    }
  }, [isFormOpen]);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  const resetForm = () => {
    setDescription(DEFAULT_DESCRIPTION);
    setDuration(DEFAULT_DURATION);
    setCategory(DEFAULT_CATEGORY);
    setNotes(DEFAULT_NOTES);
    setActivityTime(roundToNearestTenMinutes(new Date()));
    setSelectedLabels(DEFAULT_LABELS);
    setEditingActivity(null);
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    const newDate = direction === 'left' 
      ? addDays(selectedDate, -1)
      : addDays(selectedDate, 1);
    setSelectedDate(newDate);
  };

  const handleDeleteActivity = async (id: string) => {
    try {
      await deleteActivity(id);
      setDeleteConfirmation(null);
    } catch (error) {
      console.error('Failed to delete activity:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    
    try {
      const durationInMinutes = parseInt(duration);
      if (isNaN(durationInMinutes)) {
        throw new Error('Duration must be a valid number');
      }

      if (editingActivity) {
        await updateActivity(editingActivity.id, {
          description,
          duration: durationInMinutes,
          category,
          notes: notes.trim() || undefined,
          timestamp: activityTime,
          labels: selectedLabels
        });
      } else {
        await addActivity({
          description,
          duration: durationInMinutes,
          category,
          notes: notes.trim() || undefined,
          timestamp: activityTime,
          labels: selectedLabels
        });
      }
      resetForm();
      setIsFormOpen(false);
    } catch (error) {
      console.error('Failed to save activity:', error);
    }
  };

  const handleActivityClick = (activity: Activity) => {
    setEditingActivity(activity);
    setDescription(activity.description || '');
    setDuration(String(activity.duration || '0'));
    setCategory(activity.category || 'Other');
    setNotes(activity.notes || '');
    setActivityTime(new Date(activity.timestamp));
    setSelectedLabels(activity.labels || []);
    setIsFormOpen(true);
  };

  const groupedActivities = activities.reduce((acc, activity) => {
    const hour = startOfHour(new Date(activity.timestamp)).getTime();
    if (!acc[hour]) {
      acc[hour] = [];
    }
    acc[hour].push(activity);
    return acc;
  }, {} as Record<number, typeof activities>);

  const sortedHours = Object.keys(groupedActivities)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100">
      <div className={`relative ${isFormOpen || deleteConfirmation ? 'blur-sm' : ''}`}>
        <div className="fixed top-0 left-0 right-0 bg-gradient-to-br from-purple-100 to-blue-100 z-10 pb-4">
          <div className="max-w-md mx-auto p-4">
            <div className="flex items-center mb-6">
              <div className="flex items-center gap-2">
                <Menu className="w-6 h-6 text-gray-600" />
              </div>
              <h1 className="text-xl font-semibold text-gray-800 flex-1 text-center">
                What did I do today?
              </h1>
              <button
                onClick={onSignOut}
                className="text-gray-600 hover:text-gray-800"
                title="Sign out"
              >
                <LogOut className="w-6 h-6" />
              </button>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-md">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => handleSwipe('left')}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setIsCalendarOpen(true)}
                  className="flex flex-col items-center flex-1"
                >
                  <p className="text-sm text-gray-500">{format(selectedDate, 'EEEE')}</p>
                  <p className="text-2xl font-bold text-gray-800">{format(selectedDate, 'dd MMM yyyy')}</p>
                </button>
                <button
                  onClick={() => handleSwipe('right')}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-md mx-auto px-4 pt-48 pb-24">
          {/* Goals Section */}
          {goals.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3 text-gray-800">Goals for Today</h2>
              <div className="space-y-2">
                {goals.map(goal => (
                  <div key={goal.id} className="bg-white rounded-xl p-4 shadow-md">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${goal.completed ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className="text-gray-800">{goal.title || goal.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activities Section */}
          <div className="space-y-4">
            {sortedHours.map((hour) => (
              <div key={hour} className="bg-white rounded-xl p-4 shadow-md">
                <div className="flex items-start gap-3">
                  <div className="text-sm text-gray-500 mt-1 w-12">
                    {format(new Date(hour), 'HH:mm')}
                  </div>
                  <div className="flex-1">
                    <div className="space-y-2">
                      {groupedActivities[hour].map((activity) => (
                        <div
                          key={activity.id}
                          className="flex items-center gap-2 group cursor-pointer hover:bg-gray-50 rounded-lg p-2 -mx-2"
                          onClick={() => handleActivityClick(activity)}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-gray-800">{String(activity.description || '')}</p>
                              <span className="text-sm text-gray-500">({String(activity.duration || 0)} min)</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                                {String(activity.category || 'Other')}
                              </span>
                              {activity.labels && activity.labels.length > 0 && (
                                <ActivityLabels labelIds={activity.labels} />
                              )}
                            </div>
                            {activity.notes && (
                              <p className="text-sm text-gray-600 mt-1">{String(activity.notes)}</p>
                            )}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirmation(activity.id);
                            }}
                            className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isCalendarOpen && (
        <CalendarModal onClose={() => setIsCalendarOpen(false)} />
      )}

      {isFormOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-40">
          <form 
            onSubmit={handleSubmit} 
            className="activity-form bg-white rounded-xl p-4 shadow-lg w-80 space-y-4"
          >
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Activity name"
              autoFocus
            />
            <div className="flex gap-2">
              <div className="w-1/2">
                <label className="block text-sm text-gray-500 mb-1">Time</label>
                <div className="p-3 border border-gray-200 rounded-lg flex items-center gap-3 h-[46px]">
                  <Clock className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  <div className="flex-1 flex items-center justify-between">
                    <div className="flex-1 text-center font-medium">
                      {format(activityTime, 'HH:mm')}
                    </div>
                    <div className="flex flex-col h-full -my-0.5">
                      <button 
                        type="button"
                        onClick={() => {
                          const newTime = new Date(activityTime);
                          newTime.setMinutes(newTime.getMinutes() + 10);
                          setActivityTime(newTime);
                        }}
                        className="p-0.5 hover:bg-gray-100 rounded flex items-center justify-center"
                      >
                        <ChevronUp className="w-4 h-4 text-gray-600" />
                      </button>
                      <button 
                        type="button"
                        onClick={() => {
                          const newTime = new Date(activityTime);
                          newTime.setMinutes(newTime.getMinutes() - 10);
                          setActivityTime(newTime);
                        }}
                        className="p-0.5 hover:bg-gray-100 rounded flex items-center justify-center"
                      >
                        <ChevronDown className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-1/2">
                <label className="block text-sm text-gray-500 mb-1">Duration</label>
                <div className="p-3 border border-gray-200 rounded-lg flex items-center gap-3 h-[46px]">
                  <Clock className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  <div className="flex-1 flex items-center justify-between">
                    <div className="flex-1 text-center font-medium">
                      {duration} <span className="text-gray-500 text-sm">min</span>
                    </div>
                    <div className="flex flex-col h-full -my-0.5">
                      <button 
                        type="button"
                        onClick={() => {
                          const newDuration = parseInt(duration) + 10;
                          setDuration(newDuration.toString());
                        }}
                        className="p-0.5 hover:bg-gray-100 rounded flex items-center justify-center"
                      >
                        <ChevronUp className="w-4 h-4 text-gray-600" />
                      </button>
                      <button 
                        type="button"
                        onClick={() => {
                          const newDuration = Math.max(0, parseInt(duration) - 10);
                          setDuration(newDuration.toString());
                        }}
                        className="p-0.5 hover:bg-gray-100 rounded flex items-center justify-center"
                      >
                        <ChevronDown className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Date</label>
              <input
                type="date"
                value={format(activityTime, 'yyyy-MM-dd')}
                onChange={(e) => {
                  const currentTime = format(activityTime, 'HH:mm');
                  const newDateTime = new Date(`${e.target.value}T${currentTime}`);
                  setActivityTime(newDateTime);
                }}
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select category</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Notes (optional)"
              rows={2}
            />
            <button
              type="submit"
              className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors"
              disabled={!description || !duration || !category}
            >
              Save Activity
            </button>
          </form>
        </div>
      )}

      {deleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-lg max-w-sm w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Delete Activity</h3>
              <button
                onClick={() => setDeleteConfirmation(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this activity? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmation(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteActivity(deleteConfirmation)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <ActionButtons 
        onAddClick={() => {
          setIsFormOpen(!isFormOpen);
          if (!isFormOpen) {
            resetForm();
          }
        }} 
        onGoalClick={onGoalClick}
      />
    </div>
  );
} 