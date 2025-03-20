import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight, Menu, LogOut, ArrowLeft, Plus, Home, X } from 'lucide-react';
import { useGoalStore } from '../store/goalStore';
import { useAuth } from '../auth/AuthProvider';
import { CalendarModal } from './Calendar';
import { GoalTable } from './GoalTable';
import { GoalForm } from './GoalForm';
import { Goal } from '../domain/goal';
import { ActionButtons } from './ActionButtons';
import { GoalPageActionButtons } from './GoalPageActionButtons';

interface GoalPageProps {
  onBack: () => void;
}

export function GoalPage({ onBack }: GoalPageProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);
  const [deleteGoalTitle, setDeleteGoalTitle] = useState<string>('');
  
  const {
    goals,
    loading: goalLoading,
    error: goalError,
    addGoal,
    deleteGoal,
    updateGoal,
    loadGoals,
    selectedDate,
    setSelectedDate
  } = useGoalStore();

  const { signOut } = useAuth();

  useEffect(() => {
    loadGoals(selectedDate);
  }, [selectedDate, loadGoals]);

  const handleSwipe = (direction: 'left' | 'right') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + (direction === 'left' ? -1 : 1));
    setSelectedDate(newDate);
  };

  const handleSubmit = async (goalData: Partial<Goal>) => {
    try {
      if (editingGoal) {
        await updateGoal(editingGoal.id, goalData);
      } else {
        await addGoal(goalData.title || '', selectedDate);
      }
      setIsFormOpen(false);
      setEditingGoal(null);
      loadGoals(selectedDate);
    } catch (error) {
      console.error('Failed to save goal:', error);
    }
  };

  const handleGoalClick = (goal: Goal) => {
    setEditingGoal(goal);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (goalId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (goal) {
      setDeleteGoalTitle(goal.title || '');
      setDeleteConfirmation(goalId);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    try {
      await deleteGoal(id);
      setDeleteConfirmation(null);
      loadGoals(selectedDate);
    } catch (error) {
      console.error('Failed to delete goal:', error);
    }
  };

  if (goalLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading goals...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100">
      <div className={`relative ${isFormOpen || deleteConfirmation ? 'blur-sm' : ''}`}>
        <div className="fixed top-0 left-0 right-0 bg-gradient-to-br from-purple-100 to-blue-100 z-10 pb-4">
          <div className="max-w-md mx-auto p-4">
            <div className="flex items-center mb-6">
              <button
                onClick={onBack}
                className="text-gray-600 hover:text-gray-800"
                title="Back"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h1 className="text-xl font-semibold text-gray-800 flex-1 text-center">
                Goals
              </h1>
              <div className="flex items-center gap-2">
                <button
                  onClick={onBack}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <Menu className="w-6 h-6" />
                </button>
                <button
                  onClick={() => signOut()}
                  className="text-gray-600 hover:text-gray-800"
                  title="Sign out"
                >
                  <LogOut className="w-6 h-6" />
                </button>
              </div>
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
          {goalError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
              {goalError}
            </div>
          )}
          
          {goals.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <p>No goals for this day</p>
              <p className="text-sm mt-2">Click the + button to add a goal</p>
            </div>
          ) : (
            <GoalTable 
              goals={goals} 
              onGoalClick={handleGoalClick} 
              onDeleteClick={handleDeleteClick}
            />
          )}
        </div>
      </div>

      {isCalendarOpen && (
        <CalendarModal onClose={() => setIsCalendarOpen(false)} />
      )}

      {isFormOpen && (
        <GoalForm
          goal={editingGoal}
          onSubmit={handleSubmit}
          onClose={() => {
            setIsFormOpen(false);
            setEditingGoal(null);
          }}
        />
      )}

      {deleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-lg max-w-sm w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Delete Goal</h3>
              <button
                onClick={() => setDeleteConfirmation(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600 mb-2">
              Are you sure you want to delete this goal?
            </p>
            <p className="text-sm text-gray-500 mb-6 italic">
              "{deleteGoalTitle}"
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmation(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteGoal(deleteConfirmation)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <GoalPageActionButtons
        onBackClick={onBack}
        onAddClick={() => {
          setIsFormOpen(true);
          setEditingGoal(null);
        }}
      />
    </div>
  );
}