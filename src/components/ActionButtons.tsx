import React, { ReactNode } from 'react';
import { Plus, Target } from 'lucide-react';
import './ActionButtons.css'; // Import the CSS file

interface ActionButtonsProps {
  onAddClick: () => void;
  onGoalClick?: () => void;
  showGoalButton?: boolean;
  activityIcon?: ReactNode;
}

export function ActionButtons({ 
  onAddClick, 
  onGoalClick,
}: ActionButtonsProps) {
  return (
    <div className="action-buttons-container">
      <div className="action-buttons-wrapper">
        <button
          onClick={onGoalClick}
          className="action-button goal-button"
        >
          <Target />
        </button>
        <button
          onClick={onAddClick}
          className="action-button add-button"
        >
          <Plus />
        </button>
      </div>
    </div>
  );
}