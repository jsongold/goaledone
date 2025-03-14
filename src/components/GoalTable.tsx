import React from 'react';
import { Circle, CheckCircle, Trash2 } from 'lucide-react';
import { Goal } from '../domain/goal';

interface GoalTableProps {
  goals: Goal[];
  onGoalClick: (goal: Goal) => void;
  onDeleteClick: (goalId: string) => void;
}

export function GoalTable({ goals, onGoalClick, onDeleteClick }: GoalTableProps) {
  return (
    <div className="space-y-4">
      {goals.map((goal) => (
        <div
          key={goal.id}
          className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow group"
        >
          <div className="flex items-center gap-3">
            {goal.completed ? (
              <CheckCircle className="w-5 h-5 text-purple-600" />
            ) : (
              <Circle className="w-5 h-5 text-gray-400" />
            )}
            <div 
              className="flex-1 cursor-pointer"
              onClick={() => onGoalClick(goal)}
            >
              <h3 className="font-medium text-gray-900">
                {goal.title || goal.description || 'Untitled Goal'}
              </h3>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteClick(goal.id);
              }}
              className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
              title="Delete goal"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}