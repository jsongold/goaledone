import React, { useState, useEffect, useCallback } from 'react';
import { format, addDays, startOfHour, addMinutes } from 'date-fns';
import { Plus, Clock, Menu, LogOut, Calendar as CalendarIcon, Trash2, ChevronLeft, ChevronRight, Target, Tag, X, Circle, CheckCircle, Camera } from 'lucide-react';
import { useActivityStore } from './store/activityStore';
import { useGoalStore } from './store/goalStore';
import { useAuth } from './auth/AuthProvider';
import { AuthForm } from './components/AuthForm';
import { CalendarModal } from './components/Calendar';
import { GoalPage } from './components/GoalPage';
import { LabelPicker } from './components/LabelPicker';
import { ActivityLabels } from './components/ActivityLabels';
import { OCRCapture } from './components/OCRCapture';
import { useLabelStore } from './store/labelStore';
import { Activity } from './domain/activity';
import { Goal } from './domain/goal';

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

function roundToNearestTenMinutes(date: Date): Date {
  const minutes = date.getMinutes();
  const roundedMinutes = Math.round(minutes / 10) * 10;
  return addMinutes(startOfHour(date), roundedMinutes);
}

function App() {
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('30');
  const [category, setCategory] = useState('Other');
  const [notes, setNotes] = useState('');
  const [activityTime, setActivityTime] = useState(roundToNearestTenMinutes(new Date()));
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [showGoalPage, setShowGoalPage] = useState(false);
  const [showOCR, setShowOCR] = useState(false);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);
  const { user, signOut, loading: authLoading } = useAuth();

  const { activities, loading, error, addActivity, deleteActivity, updateActivity, loadActivities, selectedDate, setSelectedDate } = useActivityStore();
  const { goals, loadGoals, updateGoal } = useGoalStore();
  const { loadLabels } = useLabelStore();

  useEffect(() => {
    if (user) {
      loadActivities(selectedDate);
      loadGoals(selectedDate);
      loadLabels();
    }
  }, [selectedDate, user]);

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
    setDescription('');
    setDuration('30');
    setCategory('Other');
    setNotes('');
    setActivityTime(roundToNearestTenMinutes(new Date()));
    setSelectedLabels([]);
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

  const handleGoalToggle = async (goal: Goal) => {
    try {
      await updateGoal(goal.id, {
        ...goal,
        completed: !goal.completed
      });
    } catch (error) {
      console.error('Failed to update goal:', error);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  if (showGoalPage) {
    return <GoalPage onBack={() => setShowGoalPage(false)} />;
  }

  if (showOCR) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100">
        <div className="fixed top-0 left-0 right-0 bg-gradient-to-br from-purple-100 to-blue-100 z-10 pb-4">
          <div className="max-w-md mx-auto p-4">
            <div className="flex items-center mb-6">
              <button
                onClick={() => setShowOCR(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <h1 className="text-xl font-semibold text-gray-800 flex-1 text-center">
                OCR Capture
              </h1>
            </div>
          </div>
        </div>
        <div className="pt-24">
          <OCRCapture />
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    
    try {
      const durationInMinutes = parseInt(duration);
      if (isNaN(durationInMinutes)) return;

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
    setDuration(String(activity.duration || '30'));
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
                onClick={() => signOut()}
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
            <div className="bg-white rounded-xl p-4 shadow-md mb-4">
              <h2 className="text-lg font-semibold mb-3">Today's Goals</h2>
              <div className="space-y-2">
                {goals.map((goal) => (
                  <div
                    key={goal.id}
                    className="flex items-center gap-3 group cursor-pointer hover:bg-gray-50 rounded-lg p-2 -mx-2"
                  >
                    <button
                      onClick={() => handleGoalToggle(goal)}
                      className="text-gray-400 hover:text-purple-600 transition-colors"
                    >
                      {goal.completed ? (
                        <CheckCircle className="w-5 h-5 text-purple-600" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>
                    <span className={goal.completed ? 'line-through text-gray-500' : 'text-gray-800'}>
                      {goal.title || goal.description}
                    </span>
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
                              <span className="text-sm text-gray-500">({String(activity.duration || 30)} min)</span>
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
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2">
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
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-1/2 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Duration (min)"
                min="1"
                step="10"
              />
              <input
                type="time"
                value={format(activityTime, 'HH:mm')}
                onChange={(e) => {
                  const [hours, minutes] = e.target.value.split(':');
                  const newTime = new Date(activityTime);
                  newTime.setHours(parseInt(hours));
                  newTime.setMinutes(Math.round(parseInt(minutes) / 10) * 10);
                  setActivityTime(newTime);
                }}
                className="w-1/2 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                step="600"
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

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4">
        <button
          onClick={() => setShowOCR(true)}
          className="bg-purple-600 text-white p-4 rounded-full shadow-lg hover:bg-purple-700 transition-colors transform hover:scale-105"
        >
          <Camera className="w-6 h-6" />
        </button>
        <button
          onClick={() => setShowGoalPage(true)}
          className="bg-purple-600 text-white p-4 rounded-full shadow-lg hover:bg-purple-700 transition-colors transform hover:scale-105"
        >
          <Target className="w-6 h-6" />
        </button>
        <button
          onClick={() => {
            setIsFormOpen(!isFormOpen);
            if (!isFormOpen) {
              resetForm();
            }
          }}
          className="add-button bg-purple-600 text-white p-4 rounded-full shadow-lg hover:bg-purple-700 transition-colors transform hover:scale-105"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}

export default App;