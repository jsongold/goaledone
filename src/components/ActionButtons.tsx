import React, { ReactNode } from 'react';
import { Plus, Target } from 'lucide-react';

interface ActionButtonsProps {
  onAddClick: () => void;
  onGoalClick?: () => void;
  showGoalButton?: boolean;
  activityIcon?: ReactNode;
}

export function ActionButtons({ 
  onAddClick, 
  onGoalClick,
  showGoalButton = false,
  activityIcon
}: ActionButtonsProps) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
      <div className="flex items-center gap-4">
        {showGoalButton && (
          <button
            onClick={onGoalClick}
            className="bg-purple-600 text-white p-4 rounded-full shadow-lg hover:bg-purple-700 transition-colors transform hover:scale-105"
          >
            <Target className="w-6 h-6" />
          </button>
        )}
        {activityIcon && (
          <button
            onClick={onAddClick}
            className="bg-purple-600 text-white p-4 rounded-full shadow-lg hover:bg-purple-700 transition-colors transform hover:scale-105"
          >
            {activityIcon}
          </button>
        )}
        {!activityIcon && (
          <button
            onClick={onAddClick}
            className="bg-purple-600 text-white p-4 rounded-full shadow-lg hover:bg-purple-700 transition-colors transform hover:scale-105"
          >
            <Plus className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
}