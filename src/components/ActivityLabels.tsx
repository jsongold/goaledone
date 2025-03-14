import React from 'react';
import { useLabelStore } from '../store/labelStore';

interface ActivityLabelsProps {
  labelIds: string[];
}

export function ActivityLabels({ labelIds }: ActivityLabelsProps) {
  const { labels } = useLabelStore();
  const activityLabels = labels.filter(label => labelIds.includes(label.id));

  return (
    <div className="flex flex-wrap gap-1">
      {activityLabels.map(label => (
        <span
          key={label.id}
          className="px-2 py-0.5 text-xs rounded-full"
          style={{
            backgroundColor: label.color,
            color: isLightColor(label.color) ? '#000' : '#fff'
          }}
        >
          {label.name}
        </span>
      ))}
    </div>
  );
}

// Helper function to determine if a color is light
function isLightColor(color: string): boolean {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return brightness > 128;
}