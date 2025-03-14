import React, { useState, useEffect } from 'react';
import { format, startOfHour } from 'date-fns';
import { Plus, Clock, ChevronLeft, ChevronRight, CheckCircle, Circle, Trash2 } from 'lucide-react';
import { useTodoStore } from '../store/todoStore';
import { useActivityStore } from '../store/activityStore';
import { CalendarModal } from './Calendar';

export function TodoPage() {
  const [description, setDescription] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<{ id: string; description: string } | null>(null);
  
  const {
    todos,
    loading: todoLoading,
    error: todoError,
    addTodo,
    deleteTodo,
    updateTodo,
    loadTodos,
    selectedDate,
    setSelectedDate
  } = useTodoStore();

  const {
    activities,
    loading: activityLoading,
    loadActivities
  } = useActivityStore();

  useEffect(() => {
    loadTodos(selectedDate);
    loadActivities(selectedDate);
  }, [selectedDate]);

  const handleSwipe = (direction: 'left' | 'right') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + (direction === 'left' ? -1 : 1));
    setSelectedDate(newDate);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    
    try {
      if (editingTodo) {
        await updateTodo(editingTodo.id, { description });
        setEditingTodo(null);
      } else {
        await addTodo(description, selectedDate);
      }
      setDescription('');
      setIsFormOpen(false);
    } catch (error) {
      console.error('Failed to save todo:', error);
    }
  };

  const groupedActivities = activities.reduce((acc, activity) => {
    const hour = startOfHour(activity.timestamp).getTime();
    if (!acc[hour]) {
      acc[hour] = [];
    }
    acc[hour].push(activity);
    return acc;
  }, {} as Record<number, typeof activities>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100">
      <div className="fixed top-0 left-0 right-0 bg-gradient-to-br from-purple-100 to-blue-100 z-10">
        <div className="max-w-md mx-auto p-4">
          {/* Date Navigation */}
          <div className="bg-white rounded-xl p-4 shadow-md mb-6">
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

      <div className="max-w-md mx-auto p-4 pt-32 pb-24">
        {/* Todos Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Planned</h2>
          <div className="space-y-4">
            {todos.map((todo) => (
              <div key={todo.id} className="bg-white rounded-xl p-4 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <button
                      onClick={() => updateTodo(todo.id, { completed: !todo.completed })}
                      className={`text-${todo.completed ? 'purple' : 'gray'}-500 hover:text-purple-600`}
                    >
                      {todo.completed ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                    </button>
                    <span className={todo.completed ? 'line-through text-gray-500' : ''}>
                      {todo.description}
                    </span>
                  </div>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activities Section */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Completed Activities</h2>
          <div className="space-y-4">
            {Object.entries(groupedActivities).map(([hour, hourActivities]) => (
              <div key={hour} className="bg-white rounded-xl p-4 shadow-md">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-purple-500" />
                  <div>
                    <p className="text-sm text-gray-500">
                      {format(new Date(parseInt(hour)), 'HH:mm')}
                    </p>
                    {hourActivities.map((activity, idx) => (
                      <p key={activity.id} className="text-gray-800">
                        {activity.description}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Calendar Modal */}
      {isCalendarOpen && (
        <CalendarModal onClose={() => setIsCalendarOpen(false)} />
      )}

      {/* Floating Action Button and Form */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
        {isFormOpen && (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl p-4 shadow-lg w-80">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a todo"
                className="flex-1 p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={todoLoading}
                autoFocus
              />
              <button
                type="submit"
                disabled={todoLoading}
                className="bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            {todoError && (
              <p className="mt-2 text-sm text-red-600">{todoError}</p>
            )}
          </form>
        )}
        <button
          onClick={() => {
            setIsFormOpen(!isFormOpen);
            if (!isFormOpen) {
              setEditingTodo(null);
              setDescription('');
            }
          }}
          className="bg-purple-600 text-white p-4 rounded-full shadow-lg hover:bg-purple-700 transition-colors transform hover:scale-105"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}