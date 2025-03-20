import React from 'react';
import { Home, Plus } from 'lucide-react';
import './ActionButtons.css'; // Reuse the same styling

interface GoalPageActionButtonsProps {
  onBackClick: () => void;
  onAddClick: () => void;
}

export function GoalPageActionButtons({ 
  onBackClick, 
  onAddClick 
}: GoalPageActionButtonsProps) {
  return (
    <div className="action-buttons-container">
      <div className="action-buttons-wrapper">
        <button
          onClick={onBackClick}
          className="action-button goal-button"
          title="Go to Home"
        >
          <Home className="w-6 h-6" />
        </button>
        <button
          onClick={onAddClick}
          className="action-button add-button"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
} 